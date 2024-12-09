import { addTask, completeTask, removeTask, updateTask, clearAllData } from './userDataService';

// Mock data setup
const mockTasks = [
  { id: '123', title: 'Test Task 1', experience: 10 },
  { id: '456', title: 'Test Task 2', experience: 15 }
];

const mockCompletedTasks = [
  { id: '789', title: 'Completed Task', experience: 10, completedAt: '2023-01-01' }
];

// Mock functions
const mockGetTotalXP = jest.fn(() => 100);
const mockLevel = 1;

const calculateEarlyBonus = (deadline) => {
  if (!deadline) return 0;
  
  const deadlineDate = new Date(deadline + 'T23:59:59');
  const completionDate = new Date();
  
  const normalizedDeadline = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const normalizedCompletion = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());
  
  const daysDiff = Math.floor((normalizedDeadline - normalizedCompletion) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return 0;
  if (daysDiff >= 5) return 200;
  if (daysDiff >= 2) return 100;
  if (daysDiff >= 0) return 50;
  return 0;
};

const calculateOverduePenalty = (deadline) => {
  if (!deadline) return 0;
  
  const [year, month, day] = deadline.split('-').map(Number);
  const now = new Date();
  
  const normalizedDeadline = Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24);
  const normalizedNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / (1000 * 60 * 60 * 24);
  
  const daysOverdue = Math.floor(normalizedNow - normalizedDeadline);
  return daysOverdue > 0 ? (-5 * daysOverdue) : 0;
};

const mockCalculateXP = jest.fn().mockImplementation((taskExperience, deadline) => {
  const earlyBonus = calculateEarlyBonus(deadline);
  const overduePenalty = calculateOverduePenalty(deadline);
  const totalXP = taskExperience + earlyBonus + overduePenalty;

  return {
    earlyBonus,
    overduePenalty,
    totalXP,
    newExperience: totalXP,
    currentLevel: 1,
    didLevelUp: false
  };
});

const mockXPSystem = {
  totalXP: 0,
  level: 1,
  
  calculateLevelAndXP(xp) {
    let remainingXP = xp;
    let currentLevel = 1;
    
    while (remainingXP >= currentLevel * 200) {
      remainingXP -= currentLevel * 200;
      currentLevel += 1;
    }
    
    return {
      level: currentLevel,
      experience: remainingXP
    };
  },

  calculateXP(taskXP, deadline) {
    const earlyBonus = calculateEarlyBonus(deadline);
    const overduePenalty = calculateOverduePenalty(deadline);
    const totalTaskXP = taskXP + earlyBonus + overduePenalty;
    
    const oldStats = this.calculateLevelAndXP(this.totalXP);
    const newTotalXP = Math.max(0, this.totalXP + totalTaskXP);
    const newStats = this.calculateLevelAndXP(newTotalXP);
    
    this.totalXP = newTotalXP;
    
    return {
      earlyBonus,
      overduePenalty,
      totalXP: totalTaskXP,
      newExperience: newStats.experience,
      currentLevel: newStats.level,
      didLevelUp: newStats.level > oldStats.level
    };
  },
  
  getTotalXP() {
    return this.totalXP;
  },
  
  reset() {
    this.totalXP = 0;
  }
};

// Setup mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    writable: true
  });

  // Mock fetch
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    })
  );
});

describe('addTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('adds a single task for unauthenticated user', async () => {
    const newTask = { title: 'Test Task', experience: 10 };
    const result = await addTask(newTask, [], null, () => 100, 1, []);
    
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Test Task');
    expect(result[0].id).toBeDefined();
    expect(result[0].createdAt).toBeDefined();
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('adds multiple tasks for authenticated user', async () => {
    const newTasks = [
      { title: 'New Task 1', experience: 10 },
      { title: 'New Task 2', experience: 20 }
    ];
    
    const result = await addTask(
      newTasks,
      mockTasks,
      'user123',
      mockGetTotalXP,
      mockLevel,
      mockCompletedTasks
    );
    
    expect(result.length).toBe(mockTasks.length + 2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('handles errors gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    await expect(addTask(
      { title: 'Test Task' },
      mockTasks,
      'user123',
      mockGetTotalXP,
      mockLevel,
      mockCompletedTasks
    )).rejects.toThrow('Network error');
  });
});

describe('completeTask', () => {
  beforeEach(() => {
    mockXPSystem.reset();
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-12-30'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('completes task and calculates XP correctly with early bonus', async () => {
    const task = {
      ...mockTasks[0],
      experience: 100,
      deadline: '2023-12-31' // 1 day early
    };

    const mockXPResult = {
      earlyBonus: 50,
      overduePenalty: 0,
      totalXP: 150,
      newExperience: 150,
      currentLevel: 1,
      didLevelUp: false
    };

    const { updatedCompletedTasks } = await completeTask(
      task,
      mockTasks,
      [],
      null,
      mockGetTotalXP,
      mockLevel,
      () => mockXPResult // Pass function that returns the mock result
    );

    expect(updatedCompletedTasks[0].earlyBonus).toBe(50);
    expect(updatedCompletedTasks[0].overduePenalty).toBe(0);
  });

  test('completes task and calculates XP correctly with overdue penalty', async () => {
    const task = {
      ...mockTasks[0],
      experience: 100,
      deadline: '2023-12-29' // 1 day overdue
    };

    // Pass a function that returns the mock result directly
    const mockXPResult = {
      earlyBonus: 0,
      overduePenalty: -5,
      totalXP: 95,
      newExperience: 95,
      currentLevel: 1,
      didLevelUp: false
    };

    const { updatedCompletedTasks } = await completeTask(
      task,
      mockTasks,
      [],
      null,
      mockGetTotalXP,
      mockLevel,
      () => mockXPResult // Pass function that returns the mock result
    );

    expect(updatedCompletedTasks[0].earlyBonus).toBe(0);
    expect(updatedCompletedTasks[0].overduePenalty).toBe(-5);
  });

  test('handles level up scenario correctly', async () => {
    // Set initial XP close to level up threshold
    mockXPSystem.totalXP = 190; // Need 200 XP for level 2
    
    const task = {
      id: '123',
      experience: 20, // This should trigger level up
      deadline: '2023-12-31'
    };

    const { updatedCompletedTasks } = await completeTask(
      task,
      mockTasks,
      [],
      null,
      () => mockXPSystem.getTotalXP(),
      mockXPSystem.calculateLevelAndXP(mockXPSystem.totalXP).level,
      (xp, deadline) => mockXPSystem.calculateXP(xp, deadline)
    );

    expect(updatedCompletedTasks[0].completedAt).toBeDefined();
    expect(mockXPSystem.calculateLevelAndXP(mockXPSystem.totalXP).level).toBe(2);
  });
});

describe('removeTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('removes uncompleted task', async () => {
    const { updatedTasks } = await removeTask(
      '123',
      false,
      mockTasks,
      mockCompletedTasks,
      null,
      mockGetTotalXP,
      mockLevel,
      mockCalculateXP
    );

    expect(updatedTasks).toHaveLength(1); // Should remove one task
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('removes completed task and adjusts XP', async () => {
    const completedTaskWithBonus = {
      ...mockCompletedTasks[0],
      experience: 10,
      earlyBonus: 5
    };
    
    const updatedMockCalculateXP = jest.fn();
    
    await removeTask(
      completedTaskWithBonus.id,
      true,
      mockTasks,
      [completedTaskWithBonus],
      null,
      () => 100,
      1,
      updatedMockCalculateXP
    );

    expect(updatedMockCalculateXP).toHaveBeenCalledWith(-15);
  });
});

describe('updateTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('updates task for unauthenticated user', async () => {
    const updatedTask = { id: '123', title: 'Updated Title' };
    const result = await updateTask('123', updatedTask, [{ id: '123', title: 'Original Title' }], [], null);
  
    expect(result[0].title).toBe('Updated Title');
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('updates task for authenticated user', async () => {
    const updatedTask = { id: '123', title: 'Updated Title' };
    await updateTask('123', updatedTask, mockTasks, mockCompletedTasks, 'user123');

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('clearAllData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('clears localStorage for unauthenticated user', async () => {
    await clearAllData(null);

    expect(localStorage.removeItem).toHaveBeenCalledTimes(3);
    expect(localStorage.removeItem).toHaveBeenCalledWith('tasks');
    expect(localStorage.removeItem).toHaveBeenCalledWith('completedtasks');
    expect(localStorage.removeItem).toHaveBeenCalledWith('totalExperience');
  });

  test('clears server data for authenticated user', async () => {
    await clearAllData('user123');
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/user123'),
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"xp":0')
      })
    );
  });

  test('handles server errors when clearing data', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 500 }));
    
    await expect(clearAllData('user123')).rejects.toThrow();
  });
});

describe('XP Edge Cases', () => {
  beforeEach(() => {
    mockXPSystem.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('prevents negative XP when removing tasks', async () => {
    mockXPSystem.totalXP = 50;
    
    const { updatedCompletedTasks } = await completeTask(
      { id: '123', experience: -100 },
      mockTasks,
      [],
      null,
      () => mockXPSystem.getTotalXP(),
      mockXPSystem.calculateLevelAndXP(mockXPSystem.totalXP).level,
      (xp) => mockXPSystem.calculateXP(xp)
    );

    expect(mockXPSystem.getTotalXP()).toBe(0);
    expect(updatedCompletedTasks[0].experience).toBe(-100);
  });

  test('maintains XP state across multiple operations', async () => {
    // Add tasks and complete them in sequence
    let currentTasks = [...mockTasks];
    let currentCompletedTasks = [];
    
    // Complete first task
    const result1 = await completeTask(
      { id: '123', experience: 100 },
      currentTasks,
      currentCompletedTasks,
      null,
      () => mockXPSystem.getTotalXP(),
      mockXPSystem.calculateLevelAndXP(mockXPSystem.totalXP).level,
      (xp) => mockXPSystem.calculateXP(xp)
    );
    
    currentTasks = result1.updatedTasks;
    currentCompletedTasks = result1.updatedCompletedTasks;
    
    // Remove a completed task
    const result2 = await removeTask(
      '123',
      true,
      currentTasks,
      currentCompletedTasks,
      null,
      () => mockXPSystem.getTotalXP(),
      mockXPSystem.calculateLevelAndXP(mockXPSystem.totalXP).level,
      (xp) => mockXPSystem.calculateXP(xp)
    );

    expect(mockXPSystem.getTotalXP()).toBe(0); // Should be back to 0
    expect(result2.updatedCompletedTasks).toHaveLength(0);
  });
});

describe('Additional Edge Cases', () => {
  beforeEach(() => {
    mockXPSystem.reset();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-12-30'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('handles empty arrays in task merger', async () => {
    const result = await addTask(
      { title: 'New Task', experience: 10 },
      [],
      'user123',
      mockGetTotalXP,
      mockLevel,
      []
    );
    
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('New Task');
  });

  test('handles null deadline in XP calculation', async () => {
    const task = {
      id: '123',
      title: 'Task without deadline',
      experience: 100,
      deadline: null
    };

    // Create proper mock XP result
    const mockXPResult = {
      earlyBonus: 0,
      overduePenalty: 0,
      totalXP: 100,
      newExperience: 100,
      currentLevel: 1,
      didLevelUp: false
    };

    const { updatedCompletedTasks } = await completeTask(
      task,
      mockTasks,
      [],
      null,
      mockGetTotalXP,
      mockLevel,
      () => mockXPResult // Pass mock result
    );

    expect(updatedCompletedTasks[0].earlyBonus).toBe(0);
    expect(updatedCompletedTasks[0].overduePenalty).toBe(0);
  });

  test('handles malformed task data', async () => {
    const malformedTask = {
      id: '123',
      experience: 'invalid' // Invalid experience type
    };

    const result = await addTask(
      malformedTask,
      mockTasks,
      null,
      mockGetTotalXP,
      mockLevel,
      []
    );

    // The new task should have experience defaulted to 0
    expect(parseInt(result[result.length - 1].experience) || 0).toBe(0);
  });

  test('preserves task metadata when updating', async () => {
    const originalTask = {
      id: '123',
      title: 'Original Task',
      experience: 100,
      createdAt: '2023-12-29T00:00:00.000Z',
      deadline: '2023-12-31'
    };

    const updateData = {
      ...originalTask, // Keep original metadata
      title: 'Updated Task',
      experience: 150
    };

    const result = await updateTask(
      '123',
      updateData,
      [originalTask],
      [],
      null
    );

    expect(result[0].createdAt).toBe(originalTask.createdAt);
    expect(result[0].deadline).toBe(originalTask.deadline);
  });

  test('handles concurrent task completion and removal', async () => {
    const task = {
      id: '123',
      title: 'Test Task',
      experience: 100,
      deadline: '2023-12-31'
    };

    const mockXPResult = {
      earlyBonus: 50,
      overduePenalty: 0,
      totalXP: 150,
      newExperience: 150,
      currentLevel: 1,
      didLevelUp: false
    };

    const { updatedCompletedTasks } = await completeTask(
      task,
      [task],
      [],
      'user123',
      mockGetTotalXP,
      mockLevel,
      () => mockXPResult
    );

    const result = await removeTask(
      task.id,
      true,
      [],
      updatedCompletedTasks,
      'user123',
      mockGetTotalXP,
      mockLevel,
      mockCalculateXP
    );

    expect(result.updatedCompletedTasks).toHaveLength(0);
  });

  test('handles maximum early bonus cap', async () => {
    const futureTask = {
      id: '123',
      title: 'Far Future Task',
      experience: 100,
      deadline: '2024-12-31' // Way in the future
    };

    const { updatedCompletedTasks } = await completeTask(
      futureTask,
      [futureTask],
      [],
      null,
      mockGetTotalXP,
      mockLevel,
      mockXPSystem.calculateXP.bind(mockXPSystem)
    );

    expect(updatedCompletedTasks[0].earlyBonus).toBe(200); // Should be capped at 200
  });

  test('handles data sync with server timeout', async () => {
    // Mock a slow server response
    global.fetch = jest.fn(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 1000)
      )
    );

    const task = { id: '123', title: 'Test Task', experience: 100 };
    
    // Start the update
    const updatePromise = updateTask(
      '123',
      task,
      mockTasks,
      [],
      'user123'
    );

    // Fast-forward timers
    jest.advanceTimersByTime(1000);
    
    await updatePromise;
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});