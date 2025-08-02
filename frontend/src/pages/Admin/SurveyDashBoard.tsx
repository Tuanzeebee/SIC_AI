import React, { useEffect, useState } from "react";
import axios from "axios";

interface SurveyQuestion {
  id: number;
  text: string;
  category: string;
  options: string[];
  isActive: boolean;
  allowMultiple?: boolean; // Thêm field cho phép chọn nhiều
}

export const SurveyDashboard: React.FC = () => {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    category: "GENERAL",
    options: [""],
    allowMultiple: false, // Thêm state cho allowMultiple
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await axios.get("/api/survey-questions");
    setQuestions(res.data);
  };

  const handleAddOption = () => {
    setNewQuestion((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...newQuestion.options];
    updated[index] = value;
    setNewQuestion({ ...newQuestion, options: updated });
  };

  const handleRemoveOption = (index: number) => {
    if (newQuestion.options.length > 1) {
      const updated = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion({ ...newQuestion, options: updated });
    }
  };

  const handleCreate = async () => {
    await axios.post("/api/survey-questions", newQuestion);
    setNewQuestion({ text: "", category: "GENERAL", options: [""], allowMultiple: false });
    fetchQuestions();
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`/api/survey-questions/${id}`);
    fetchQuestions();
  };

  const handleToggleActive = async (id: number) => {
    await axios.patch(`/api/survey-questions/${id}/toggle`);
    fetchQuestions();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Survey Dashboard</h1>

      <div className="mb-6 border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Thêm câu hỏi mới</h2>
        <input
          className="border px-2 py-1 w-full mb-2"
          placeholder="Nội dung câu hỏi"
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
        />
        <select
          className="border px-2 py-1 w-full mb-2"
          value={newQuestion.category}
          onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
        >
          <option value="GENERAL">GENERAL</option>
          <option value="EMOTIONAL">EMOTIONAL</option>
          <option value="FINANCIAL">FINANCIAL</option>
        </select>
        
        {/* Thêm checkbox cho phép chọn nhiều */}
        <div className="mb-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newQuestion.allowMultiple}
              onChange={(e) => setNewQuestion({ ...newQuestion, allowMultiple: e.target.checked })}
              className="mr-2"
            />
            <span>Cho phép chọn nhiều lựa chọn</span>
          </label>
        </div>

        {newQuestion.options.map((opt, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input
              className="border px-2 py-1 flex-1"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
            />
            {newQuestion.options.length > 1 && (
              <button
                type="button"
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleRemoveOption(i)}
              >
                Xóa
              </button>
            )}
          </div>
        ))}
        <button className="text-blue-600 mt-2" onClick={handleAddOption}>
          + Thêm lựa chọn
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
          onClick={handleCreate}
        >
          Lưu câu hỏi
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Danh sách câu hỏi</h2>
        {questions.map((q) => (
          <div key={q.id} className="border p-4 mb-2 rounded shadow">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{q.text}</p>
                <p className="text-sm text-gray-600">Phân loại: {q.category}</p>
                {/* Hiển thị thông tin cho phép chọn nhiều */}
                <p className="text-sm text-gray-600">
                  Loại: {q.allowMultiple ? "Chọn nhiều" : "Chọn một"}
                </p>
                <ul className="list-disc ml-5 text-sm mt-1">
                  {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(q.id)}
                  className={`px-2 py-1 rounded text-white ${q.isActive ? "bg-green-600" : "bg-gray-400"}`}
                >
                  {q.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};