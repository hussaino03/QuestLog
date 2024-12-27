/**
 * Checks if a task's deadline has passed
 * @param {string} deadline - The deadline date in YYYY-MM-DD format
 * @returns {boolean} True if the deadline has passed, false otherwise
 */
export const isOverdue = (deadline) => {
    if (!deadline) return false;

    const [year, month, day] = deadline.split('-').map(Number);
    const deadlineDate = new Date(year, month - 1, day, 23, 59, 59); // Set to end of deadline day

    const now = new Date();
    return now > deadlineDate;
};

/**
 * Calculates the experience penalty for overdue tasks
 * @param {string} deadline - The deadline date in YYYY-MM-DD format
 * @returns {number} The experience penalty (-5XP per day overdue, 0 if not overdue)
 */
export const calculateOverduePenalty = (deadline) => {
    if (!deadline) return 0;

    const [year, month, day] = deadline.split('-').map(Number);
    const now = new Date();

    // Use UTC to avoid timezone issues
    const normalizedDeadline = Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24);
    const normalizedNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / (1000 * 60 * 60 * 24);

    const daysOverdue = Math.floor(normalizedNow - normalizedDeadline);
    return daysOverdue > 0 ? -5 * daysOverdue : 0;
};

/**
 * Handles task edit operations and calculates new experience values
 * @param {Object} task - The original task object
 * @param {Object} editForm - The form data containing updated values
 * @param {string} editForm.name - Task name
 * @param {string} editForm.desc - Task description
 * @param {string} [editForm.deadline] - Optional deadline in YYYY-MM-DD format
 * @param {number} editForm.difficulty - Task difficulty (0-100)
 * @param {number} editForm.importance - Task importance (0-100)
 * @param {boolean} editForm.collaborative - Whether task is collaborative
 * @param {string} [editForm.label] - Optional task label
 * @returns {Object} Updated task object with recalculated experience points
 */
export const handleEdit = (task, editForm) => {
    return {
        ...task,
        ...editForm,
        experience: (parseInt(editForm.difficulty) + parseInt(editForm.importance) + 20) * 5 +
            parseInt((parseInt(editForm.difficulty) * parseInt(editForm.importance)) / 20) +
            (editForm.collaborative ? 150 : 0)
    };
};

/**
 * Formats a deadline date string into localized date string
 * @param {string} deadline - The deadline date in YYYY-MM-DD format
 * @returns {string} Localized date string or empty string if no deadline
 */
export const formatDeadline = (deadline) => {
    if (!deadline) return '';

    const [year, month, day] = deadline.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based in Date constructor

    return date.toLocaleDateString();
};

/**
 * Checks if an element's text content is truncated
 * @param {HTMLElement} element - The DOM element to check
 * @returns {boolean} True if the text is truncated, false otherwise
 */
export const checkTextTruncation = (element) => {
    if (element) {
        return element.scrollWidth > element.offsetWidth;
    }
    return false;
};
