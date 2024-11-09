import React, { useState } from 'react';

const TaskForm = ({ addTask }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(50);
  const [importance, setImportance] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      name,
      desc: description,
      difficulty,
      importance,
      experience: ((parseInt(difficulty) + parseInt(importance) + 20) * 5 + parseInt(parseInt(difficulty) * parseInt(importance) / 20)),
      completion: false
    };
    addTask(newTask);
    setName('');
    setDescription('');
    setDifficulty(50);
    setImportance(50);
    document.getElementById('newtask-form').style.display = 'none';
  };

  return (
    <div id='newtask-form' className='modal'>
      <form onSubmit={handleSubmit} className='modal-content animate'>
        <div className="imgcontainer">
          <span onClick={() => document.getElementById('newtask-form').style.display='none'} className="close" title="Close Modal">&times;</span>
          <h3 style={{ marginBottom: '8px' }}>Create a new task!</h3>
          <img src="/main.png" alt="Task icon" />
          <input type="text" placeholder="Add new task" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Task description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <hr />
          <div>
            <span className='slider' style={{ bottom: '10px' }}>Very easy</span>
            <input type="range" min="1" max="100" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className='slider' />
            <span className='slider' style={{ bottom: '10px' }}>Very hard</span>
          </div>
          <div>
            <span className='slider' style={{ bottom: '10px' }}>Not important</span>
            <input type="range" min="1" max="100" value={importance} onChange={(e) => setImportance(e.target.value)} className='slider' />
            <span className='slider' style={{ bottom: '10px' }}>Very important</span>
          </div>
          <button type="submit">Press Enter or click to submit</button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
