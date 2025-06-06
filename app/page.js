"use client";

import { useState, useEffect } from "react";
import questions from "../questions.json";

export default function Home() {
    const randomQuestion = (mastered, previous = null) => {
        let arr = [...questions];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        let rem = arr.filter((q) => !mastered.has(q.question));
        if (previous && rem.length > 1) {
            rem = rem.filter(q => q.question !== previous.question)
        }

        return rem[0];
    };

    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [mastered, setMastered] = useState(() => {
        try {
            const saved = localStorage.getItem("QUESTIONS_MASTERED");
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    useEffect(() => {
        if (!question) {
            setQuestion(randomQuestion(mastered));
        }

        localStorage.setItem("QUESTIONS_MASTERED", JSON.stringify(Array.from(mastered)));
    }, [mastered]);

    const progress = (mastered.size / questions.length) * 100;
    const finished = !randomQuestion(mastered);
    if (finished) {
        return (
            <main className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
                <h1 className="text-xl font-bold mb-4">FAA Knowledge Exam Review</h1>
                <p className="text-green-400">You&apos;ve mastered all the questions! 🎉</p>
                <button
                    className="mt-12 px-6 py-1 rounded-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    onClick={() => setMastered(new Set())}
                >
                    Restart questions
                </button>
            </main>
        );
    }
    if (!question) {
        return;
    }

    const handleAnswer = (choice) => {
        if (selected !== null) return;

        setSelected(choice);

        if (choice === question.correct) {
            setMastered((prev) => new Set(prev).add(question.question));
            setFeedback("✅ Correct");
        } else {
            setFeedback("❌ Wrong");
        }
    };
    const handleNext = () => {
        if (selected === null) return;

        setQuestion(previous => randomQuestion(mastered, previous));
        setSelected(null);
        setFeedback(null);
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center relative">
            <div className="max-w-2xl w-full pb-24">
                <h1 className="text-xl font-bold mb-8">FAA Knowledge Exam Review</h1>

                <p>{question.question}</p>

                <ul className="space-y-3 mt-12">
                    {question.choices.map((choice, index) => (
                        <li
                            key={index}
                            className={`p-3 border border-[rgba(255,255,255,0.2)] bg-gray-800 rounded-lg cursor-pointer transition-all duration-300
            ${selected === null
                                    ? "hover:bg-gray-700"
                                    : index === selected
                                        ? index === question.correct
                                            ? "bg-green-500"
                                            : "bg-red-600 opacity-50"
                                        : index === question.correct && "bg-green-500"
                                }
          `}
                            onClick={() => handleAnswer(index)}
                        >
                            {choice}
                        </li>
                    ))}
                </ul>
                <div className="text-base min-h-[2rem] mt-6">{feedback && <p className="font-semibold">{feedback}</p>}</div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-gray-900 p-4 border-t border-gray-700">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button
                        onClick={handleNext}
                        disabled={selected === null}
                        className={`px-6 py-1 rounded-full transition
          ${selected === null ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}
                    >
                        Next
                    </button>

                    <div className="w-[40%] md:w-[50%] text-sm text-right">
                        {mastered.size} / {questions.length}
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                            className="bg-blue-600 h-6 transition-all"
                            style={{ width: `${progress}%` }}
                            aria-label={`Progress: ${mastered.size} of ${questions.length} questions answered`}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
