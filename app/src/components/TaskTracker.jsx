
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TaskTracker() {
    // --- State Initialization with Persistence ---
    const [activeTab, setActiveTab] = useState("today"); // 'today' | 'history'

    const [sodItems, setSodItems] = useState(() => {
        const saved = localStorage.getItem("sodItems");
        return saved ? JSON.parse(saved) : [];
    });

    const [eodItems, setEodItems] = useState(() => {
        const saved = localStorage.getItem("eodItems");
        return saved ? JSON.parse(saved) : [];
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem("taskHistory");
        return saved ? JSON.parse(saved) : [];
    });

    const [sodInput, setSodInput] = useState("");

    // --- Persistence Effects ---
    useEffect(() => {
        localStorage.setItem("sodItems", JSON.stringify(sodItems));
    }, [sodItems]);

    useEffect(() => {
        localStorage.setItem("eodItems", JSON.stringify(eodItems));
    }, [eodItems]);

    useEffect(() => {
        localStorage.setItem("taskHistory", JSON.stringify(history));
    }, [history]);


    // --- Handlers ---

    const handleAddSod = (e) => {
        e.preventDefault();
        if (!sodInput.trim()) return;

        const newItem = {
            id: Date.now(),
            text: sodInput,
            completed: false,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSodItems([...sodItems, newItem]);
        setSodInput("");
    };

    const handleCompleteSod = (id) => {
        const itemToMove = sodItems.find((item) => item.id === id);
        if (!itemToMove) return;

        setSodItems(sodItems.filter((item) => item.id !== id));

        const eodItem = {
            ...itemToMove,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            comment: "",
            isNew: true,
        };

        setEodItems((prev) => [...prev, eodItem]);
    };

    const handleEodCommentUpdate = (id, comment) => {
        setEodItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, comment } : item))
        );
    };

    const handleDeleteEod = (id) => {
        if (confirm("Are you sure you want to delete this completed task?")) {
            setEodItems(eodItems.filter((item) => item.id !== id));
        }
    };

    const handleEndDay = () => {
        if (sodItems.length === 0 && eodItems.length === 0) {
            alert("Nothing to save for today!");
            return;
        }

        if (!confirm("End the day? This will clear today's list and save it to history.")) return;

        const todayEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            sodItems: [...sodItems], // Save incomplete ones too? or strictly what was done? Saving snapshot.
            eodItems: [...eodItems],
            efficiency: Math.round((eodItems.length / (eodItems.length + sodItems.length || 1)) * 100)
        };

        setHistory([todayEntry, ...history]);
        setSodItems([]);
        setEodItems([]);
        setActiveTab("history");
    };

    const handleDeleteHistoryItem = (entryId) => {
        if (confirm("Delete this history entry?")) {
            setHistory(history.filter(h => h.id !== entryId));
        }
    }


    // --- Render Components ---

    return (
        <div className="min-h-screen animate-gradient-bg text-white font-sans selection:bg-teal-500/30 overflow-hidden flex flex-col">
            {/* Navbar / Tabs */}
            <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-sky-500 to-emerald-500 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden md:inline">Daily<span className="text-sky-400">Focus</span></span>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("today")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "today"
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === "history"
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            History
                            {history.length > 0 && <span className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{history.length}</span>}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto tab-content-enter">

                    {/* --- TODAY TAB --- */}
                    {activeTab === "today" && (
                        <div className="space-y-8 pb-20">
                            {/* Hero */}
                            <header className="text-center py-8">
                                <h1 className="text-5xl font-extrabold text-gradient-sky tracking-tight mb-2">
                                    Today's Mission
                                </h1>
                                <p className="text-slate-400">Focus on what matters. Clear your list.</p>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                                {/* SOD Column */}
                                <div className="space-y-4">
                                    <div className="glass-card p-6 border-l-4 border-l-sky-500">
                                        <h2 className="text-xl font-bold text-sky-200 mb-4 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            Start of Day
                                        </h2>

                                        <form onSubmit={handleAddSod} className="relative mb-6">
                                            <input
                                                type="text"
                                                placeholder="Add a new target..."
                                                value={sodInput}
                                                onChange={(e) => setSodInput(e.target.value)}
                                                className="glass-input w-full pr-12"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!sodInput.trim()}
                                                className="absolute right-2 top-2 p-1.5 bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white rounded-lg transition-colors disabled:opacity-0"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                            </button>
                                        </form>

                                        <div className="space-y-3">
                                            {sodItems.length === 0 && (
                                                <div className="text-center py-8 text-slate-500 text-sm">
                                                    <p>No active targets.</p>
                                                </div>
                                            )}
                                            {sodItems.map((item) => (
                                                <div key={item.id} className="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-sky-500/30 transition-all hover:bg-white/10">
                                                    <span className="text-slate-200">{item.text}</span>
                                                    <button
                                                        onClick={() => handleCompleteSod(item.id)}
                                                        className="text-xs font-semibold bg-sky-500/10 text-sky-400 px-3 py-1.5 rounded-lg border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* EOD Column */}
                                <div className="space-y-4">
                                    <div className="glass-card p-6 border-l-4 border-l-emerald-500 bg-emerald-900/10">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-emerald-200 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                End of Day
                                            </h2>
                                            {eodItems.length > 0 && (
                                                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">{eodItems.length} Completed</span>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {eodItems.length === 0 && (
                                                <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-xl">
                                                    <p>Completed tasks will appear here.</p>
                                                </div>
                                            )}
                                            {eodItems.map((item) => (
                                                <div key={item.id} className="relative bg-black/20 rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="font-medium text-emerald-100">{item.text}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-slate-500 font-mono">{item.completedAt}</span>
                                                            <button
                                                                onClick={() => handleDeleteEod(item.id)}
                                                                className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Delete"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        placeholder="Add notes..."
                                                        value={item.comment}
                                                        onChange={(e) => handleEodCommentUpdate(item.id, e.target.value)}
                                                        className="w-full bg-black/20 text-sm text-slate-300 p-2 rounded-lg border border-transparent focus:border-emerald-500/30 focus:bg-black/40 outline-none resize-none h-16 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* End Day Button */}
                                        {(sodItems.length > 0 || eodItems.length > 0) && (
                                            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                                                <button
                                                    onClick={handleEndDay}
                                                    className="premium-btn btn-success"
                                                >
                                                    End Day & Save
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- HISTORY TAB --- */}
                    {activeTab === "history" && (
                        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
                            <header className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">History Archive</h2>
                                <p className="text-slate-400">Review your past performance.</p>
                            </header>

                            {history.length === 0 ? (
                                <div className="text-center py-20 text-slate-600 glass-card">
                                    <p>No history yet. End a day to see it here.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {history.map((entry) => (
                                        <div key={entry.id} className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-100">{entry.date}</h3>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${entry.efficiency >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                        {entry.efficiency}% Efficiency
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteHistoryItem(entry.id)}
                                                    className="text-slate-500 hover:text-rose-400 transition-colors p-2"
                                                    title="Delete Entry"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Completed</h4>
                                                    <ul className="space-y-2">
                                                        {entry.eodItems.length > 0 ? entry.eodItems.map((item, idx) => (
                                                            <li key={idx} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-sm text-slate-300">
                                                                <div className="font-medium text-emerald-200/80 mb-1">{item.text}</div>
                                                                {item.comment && <div className="text-xs text-slate-500 italic">"{item.comment}"</div>}
                                                            </li>
                                                        )) : <li className="text-slate-600 text-sm italic">None</li>}
                                                    </ul>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Incomplete</h4>
                                                    <ul className="space-y-2">
                                                        {entry.sodItems.length > 0 ? entry.sodItems.map((item, idx) => (
                                                            <li key={idx} className="bg-white/5 border border-white/5 rounded-lg p-3 text-sm text-slate-400 line-through decoration-slate-600">
                                                                {item.text}
                                                            </li>
                                                        )) : <li className="text-slate-600 text-sm italic">None</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
