import React, { useState } from 'react';

const QuestionModal = ({ onClose, onAddQuestion }) => {
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        type: 'short',
        required: false,
        options: [],
    });
    const [option, setOption] = useState('');
    const [isNextQuestion, setIsNextQuestion] = useState(false);
    const handleAddOption = () => {
        setNewQuestion({ ...newQuestion, options: [...newQuestion.options, option] });
        setOption('');
    };


    const handleAddQuestion = () => {
        onAddQuestion(newQuestion);
        setNewQuestion({
            question: '',
            type: 'short',
            required: false,
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
            {newQuestion.type === 'checkbox' && (
                    <div className="mt-2">
                        <label>
                            Option:
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => setOption(e.target.value)}
                                className="mt-1 w-full p-2 border rounded"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="p-2.5 bg-blue-500 rounded-xl text-white mt-2"
                        >
                            Add Option
                        </button>
                        {newQuestion.options.length > 0 && (
                            <div className="mt-4">
                                <p>Added Options:</p>
                                <ul>
                                    {newQuestion.options.map((o, index) => (
                                        <li key={index}>{o}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                <span className="close" onClick={onClose}>&times;</span>
                <label>
                    Type your question:
                    <input
                        type="text"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        className="mt-1 w-full p-2 border rounded"
                    />
                </label>
                <label className="block mt-2">
                    Question type:
                    <select
                        value={newQuestion.type}
                        onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                        className="w-full p-2 border rounded"
                    >
                        <option value="short">Short Text</option>
                        <option value="long">Long Text</option>
                        <option value="checkbox">Checkbox</option>
                        {/* Add more types as needed */}
                    </select>
                </label>
                <label className="block mt-2">
                    Is the question required?
                    <input
                        type="checkbox"
                        checked={newQuestion.required}
                        onChange={() => setNewQuestion({ ...newQuestion, required: !newQuestion.required })}
                        className="mt-1"
                    />
                </label>
                <button
                    type="button"
                    onClick={() => {
                        handleAddQuestion();
                       // setIsNextQuestion(true);
                    }}
                    className="p-2.5 bg-blue-500 rounded-xl text-white mt-2"
                >
                    Add Question
                </button>
            </div>
        </div>
    );
};

export default QuestionModal;
