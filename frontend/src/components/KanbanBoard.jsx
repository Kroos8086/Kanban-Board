import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const THEME = { bg: 'bg-[#050505]', card: 'bg-[#121212]', border: 'border-zinc-800/40', accent: 'indigo-500' };

const PriorityBadge = ({ priority }) => {
    const c = { Urgent: 'text-red-400', High: 'text-orange-400', Medium: 'text-blue-400', Low: 'text-zinc-500' };
    return <span className={`text-[9px] font-bold uppercase tracking-tighter ${c[priority] || c.Medium}`}>{priority}</span>;
};

const CardModal = ({ card, columnId, onClose, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [priority, setPriority] = useState(card.priority);
    const [attachments, setAttachments] = useState(card.attachments || []);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await axios.post(`http://localhost:5000/api/boards/card/${card.boardId || window.location.pathname.split('/').pop() || 'tmp'}/${columnId}/${card._id}/upload`, formData, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Giả lập cập nhật UI nhanh
            setAttachments([...attachments, { _id: Date.now(), filename: file.name, url: URL.createObjectURL(file) }]);
            onUpdate(columnId, card._id, { ...card }); // trigger reload
        } catch(err) {
            alert(err.response?.data?.message || "Upload thất bại!");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#111] w-full max-w-xl rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden">
                <div className="p-10 space-y-8">
                    <textarea rows="1" className="text-3xl font-bold bg-transparent border-none outline-none text-white w-full resize-none" value={title} onChange={e => setTitle(e.target.value)} />
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Description</label>
                        <textarea className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-zinc-300 outline-none focus:border-indigo-500/50 min-h-[150px] text-sm" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="flex gap-10">
                        <div className="flex-grow">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Priority</label>
                            <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-white mt-2 outline-none" value={priority} onChange={e => setPriority(e.target.value)}>
                                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Attachments</label>
                            <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all">
                                {isUploading ? 'Uploading...' : '+ Upload File'}
                                <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
                            </label>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {attachments.length === 0 ? (
                                <p className="text-xs text-zinc-600 italic">Chưa có file đính kèm nào.</p>
                            ) : (
                                attachments.map(att => (
                                    <a key={att._id} href={att.url.startsWith('blob') ? att.url : `http://localhost:5000${att.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/50 transition-all group">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-black">📄</div>
                                        <span className="text-sm text-zinc-300 group-hover:text-indigo-300 truncate">{att.filename}</span>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-zinc-900/30 border-t border-zinc-800/50 flex justify-between">
                    <button onClick={() => { onDelete(columnId, card._id); onClose(); }} className="text-red-500/40 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest">Delete</button>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="text-zinc-500 font-bold text-sm">Cancel</button>
                        <button onClick={() => { onUpdate(columnId, card._id, { title, description, priority }); onClose(); }} className="bg-indigo-600 px-8 py-3 rounded-2xl text-white font-bold text-sm shadow-xl shadow-indigo-500/20">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SortableCard = ({ card, onDelete, onOpenDetail }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id });
    const style = { transition, transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.3 : 1, zIndex: isDragging ? 100 : 1 };
    return (
        <div ref={setNodeRef} style={style} className="group bg-[#121212] p-5 rounded-2xl border border-zinc-800/30 hover:border-indigo-500/30 transition-all cursor-pointer mb-4 shadow-sm" onClick={() => onOpenDetail(card)}>
            <div className="flex justify-between items-center mb-3">
                <PriorityBadge priority={card.priority} />
                <div {...attributes} {...listeners} onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-zinc-500 p-1">⠿</div>
            </div>
            <h4 className="text-sm font-medium text-zinc-200 leading-tight">{card.title}</h4>
        </div>
    );
};

const DroppableColumn = ({ column, children, onDeleteColumn }) => {
    const { setNodeRef } = useDroppable({ id: column._id });
    return (
        <div ref={setNodeRef} className="w-[340px] flex-shrink-0 flex flex-col bg-zinc-900/10 rounded-[2rem] border border-zinc-800/20 p-5">
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{column.title}</h3>
                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-800/40 px-2 py-0.5 rounded-full">{column.cards.length}</span>
                </div>
                <button onClick={() => onDeleteColumn(column._id)} className="text-zinc-800 hover:text-red-500 text-xs">✕</button>
            </div>
            <div className="flex-grow space-y-4">{children}</div>
        </div>
    );
};

const KanbanBoard = () => {
    const [boards, setBoards] = useState([]);
    const [activeBoard, setActiveBoard] = useState(null);
    const [activeColumn, setActiveColumn] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const token = localStorage.getItem('token');
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor));

    const fetchAllBoards = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/boards', { headers: { Authorization: `Bearer ${token}` } });
            setBoards(res.data.data);
            if (res.data.data.length > 0) {
                const current = activeBoard ? res.data.data.find(b => b._id === activeBoard._id) : res.data.data[0];
                setActiveBoard(current || res.data.data[0]);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchAllBoards(); }, []);

    const handleAddCard = async (columnId) => {
        if (!newCardTitle.trim()) { setActiveColumn(null); return; }
        try { await axios.post('http://localhost:5000/api/boards/add-card', { boardId: activeBoard._id, columnId, title: newCardTitle }, { headers: { Authorization: `Bearer ${token}` } }); setNewCardTitle(''); setActiveColumn(null); fetchAllBoards(); } catch (err) { alert("Error"); }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event; if (!over) return;
        const activeId = active.id; const overId = over.id;
        let fromColId; activeBoard.columns.forEach(col => { if (col.cards.some(c => c._id === activeId)) fromColId = col._id; });
        let toColId = activeBoard.columns.find(col => col._id === overId)?._id || activeBoard.columns.find(col => col.cards.some(c => c._id === overId))?._id;
        if (!fromColId || !toColId) return;
        const toCol = activeBoard.columns.find(c => c._id === toColId);
        const overCardIndex = toCol.cards.findIndex(c => c._id === overId);
        const newIndex = overCardIndex === -1 ? toCol.cards.length : overCardIndex;
        try { await axios.put('http://localhost:5000/api/boards/move-card', { boardId: activeBoard._id, cardId: activeId, fromColId, toColId, newIndex }, { headers: { Authorization: `Bearer ${token}` } }); fetchAllBoards(); } catch (err) { fetchAllBoards(); }
    };

    if (!activeBoard) return <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em]">System Loading</div>;

    return (
        <div className="flex h-screen bg-[#050505] text-zinc-300 overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Sidebar - Cố định tinh tế */}
            <div className="w-72 bg-[#050505] border-r border-zinc-900/50 flex flex-col flex-shrink-0">
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                            <span className="text-white font-black text-lg italic">K</span>
                        </div>
                        <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-white">KanbanOS</h2>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-6 px-2">Workspaces</p>
                        {boards.map(b => (
                            <button key={b._id} onClick={() => setActiveBoard(b)} className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold transition-all flex items-center gap-4 ${activeBoard._id === b._id ? 'bg-zinc-900/50 text-white border border-zinc-800' : 'text-zinc-600 hover:text-zinc-400 border border-transparent'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${activeBoard._id === b._id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-zinc-800'}`} />
                                {b.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-auto p-8">
                    <button onClick={() => { const n = prompt("Project Name:"); if(n) axios.post('http://localhost:5000/api/boards', { name: n }, { headers: { Authorization: `Bearer ${token}` } }).then(fetchAllBoards) }} className="w-full py-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl text-zinc-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em]">+ Create New</button>
                </div>
            </div>

            {/* Main Area - Tràn viền và Căn giữa */}
            <div className="flex-grow flex flex-col min-w-0">
                <header className="h-24 flex items-center justify-between px-12 flex-shrink-0">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-bold text-white tracking-tight">{activeBoard.name}</h1>
                        <span className="text-[9px] font-bold text-zinc-600 border border-zinc-800/50 px-2 py-0.5 rounded-md uppercase tracking-widest">Active</span>
                        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all">+ Share</button>
                    </div>
                    <div className="flex items-center gap-8">
                        <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="text-[10px] font-black text-zinc-700 hover:text-red-400 uppercase tracking-widest transition-all">Log out</button>
                    </div>
                </header>

                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <main className="flex-grow overflow-x-auto p-12 pt-4 custom-scrollbar">
                        <div className={`flex gap-10 h-full min-w-full ${activeBoard.columns.length < 4 ? 'justify-center' : 'justify-start'}`}>
                            {activeBoard.columns.map((column) => (
                                <DroppableColumn key={column._id} column={column} onDeleteColumn={(id) => { if(window.confirm("Delete Column?")) axios.delete(`http://localhost:5000/api/boards/column/${activeBoard._id}/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(fetchAllBoards) }}>
                                    <SortableContext id={column._id} items={column.cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {column.cards.map((card) => (
                                                <SortableCard key={card._id} card={card} onDelete={(cardId) => handleDeleteCard(column._id, cardId)} onOpenDetail={(c) => setSelectedCard({ ...c, columnId: column._id, boardId: activeBoard._id })} />
                                            ))}
                                            {activeColumn === column._id ? (
                                                <div className="bg-zinc-900/50 rounded-2xl border border-indigo-500/30 p-3 shadow-2xl shadow-indigo-500/5">
                                                    <input autoFocus className="w-full bg-transparent text-sm text-zinc-200 p-2 outline-none" placeholder="Task name..." value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCard(column._id)} />
                                                    <div className="flex justify-end gap-3 mt-2">
                                                        <button onClick={() => setActiveColumn(null)} className="text-[10px] font-bold text-zinc-600">Cancel</button>
                                                        <button onMouseDown={(e) => { e.preventDefault(); handleAddCard(column._id); }} className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl">Add Task</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setActiveColumn(column._id)} className="w-full py-4 flex items-center justify-center gap-3 text-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/30 rounded-[1.5rem] transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-dashed border-zinc-900">+ Add Task</button>
                                            )}
                                        </div>
                                    </SortableContext>
                                </DroppableColumn>
                            ))}
                            <button onClick={() => { const t = prompt("Column Title:"); if(t) axios.post('http://localhost:5000/api/boards/column', { boardId: activeBoard._id, title: t }, { headers: { Authorization: `Bearer ${token}` } }).then(fetchAllBoards) }} className="w-[340px] h-16 flex-shrink-0 border border-dashed border-zinc-900 rounded-[2rem] flex items-center justify-center gap-3 text-zinc-700 hover:text-white hover:border-zinc-700 transition-all text-[10px] font-black uppercase tracking-[0.2em] bg-transparent">+ Add Column</button>
                        </div>
                    </main>
                </DndContext>
            </div>

            {selectedCard && (
                <CardModal 
                    card={selectedCard} 
                    columnId={selectedCard.columnId}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={(colId, cardId, data) => axios.put('http://localhost:5000/api/boards/card', { boardId: activeBoard._id, columnId: colId, cardId, updateData: data }, { headers: { Authorization: `Bearer ${token}` } }).then(fetchAllBoards)}
                    onDelete={(colId, cardId) => axios.delete(`http://localhost:5000/api/boards/card/${activeBoard._id}/${colId}/${cardId}`, { headers: { Authorization: `Bearer ${token}` } }).then(fetchAllBoards)}
                />
            )}

            {showInviteModal && (
                <InviteModal boardId={activeBoard._id} token={token} onClose={() => setShowInviteModal(false)} />
            )}
        </div>
    );
};

const InviteModal = ({ boardId, onClose, token }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');

    const handleInvite = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/boards/member', { boardId, email, role }, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message);
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi mời thành viên");
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#111] w-full max-w-md rounded-3xl border border-zinc-800 shadow-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-6">Mời thành viên</h3>
                <input 
                    type="email" placeholder="Nhập email người dùng..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-300 outline-none focus:border-indigo-500/50 mb-4 text-sm"
                    value={email} onChange={e => setEmail(e.target.value)} 
                />
                <select 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-300 outline-none mb-8 text-sm"
                    value={role} onChange={e => setRole(e.target.value)}
                >
                    <option value="viewer">Viewer (Chỉ xem)</option>
                    <option value="editor">Editor (Được chỉnh sửa)</option>
                </select>
                <div className="flex gap-4">
                    <button onClick={onClose} className="w-full py-3 text-zinc-500 font-bold hover:text-white text-sm transition-all">Hủy</button>
                    <button onClick={handleInvite} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all">Gửi Lời Mời</button>
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;
