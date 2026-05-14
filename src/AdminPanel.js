import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // तुमच्या फाईलचं नाव तपासा
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";

const AdminPanel = () => {
    const [queue, setQueue] = useState([]);
    const [currentServing, setCurrentServing] = useState("---");
    const [adminStatus, setAdminStatus] = useState("AVAILABLE");

    // १. डेटा थेट इथूनच खेचा (App.js ची वाट न बघता)
    useEffect(() => {
        const q = query(collection(db, "queue"), where("status", "==", "waiting"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setQueue(items);
        });
        return () => unsubscribe();
    }, []);

    // २. आवाज आणि कॉल नेक्स्ट लॉजिक
    const handleCallNext = async () => {
        if (queue.length > 0) {
            const nextStudent = queue[0];
            const token = nextStudent.token || "N/A";
            const name = nextStudent.name || nextStudent.studentName || "Student";

            // आवाज
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const msg = new SpeechSynthesisUtterance(`Token ${token}, ${name}, please come to the counter.`);
                window.speechSynthesis.speak(msg);
            }

            // फायरबेसमध्ये अपडेट करा
            const studentRef = doc(db, "queue", nextStudent.id);
            await updateDoc(studentRef, { status: "serving" });
            setCurrentServing(token);
        } else {
            alert("Queue संपली आहे!");
        }
    };

    return (
        <div style={{ padding: '20px', background: '#121212', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#1e1e1e', padding: '30px', borderRadius: '20px', border: '1px solid #333' }}>
                
                <h1 style={{ textAlign: 'center', color: '#ff6b00' }}>Smart Admin Panel</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '30px 0' }}>
                    <div style={{ background: '#252525', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                        <p style={{ color: '#888' }}>Now Serving</p>
                        <h2 style={{ fontSize: '50px', color: '#00ff88', margin: '10px 0' }}>{currentServing}</h2>
                    </div>
                    <div style={{ background: '#252525', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                        <p style={{ color: '#888' }}>Status</p>
                        <h2 style={{ color: adminStatus === 'AVAILABLE' ? '#00ff88' : '#dc3545', margin: '10px 0' }}>{adminStatus}</h2>
                    </div>
                </div>

                <button onClick={handleCallNext} style={{ width: '100%', padding: '20px', fontSize: '22px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>
                    ⏩ CALL NEXT TOKEN
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setAdminStatus('AVAILABLE')} style={{ flex: 1, padding: '15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px' }}>🟢 AVAILABLE</button>
                    <button onClick={() => setAdminStatus('BUSY')} style={{ flex: 1, padding: '15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px' }}>⏸ BUSY</button>
                    <button onClick={() => setAdminStatus('BREAK')} style={{ flex: 1, padding: '15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px' }}>☕ BREAK</button>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3>Waiting List ({queue.length})</h3>
                    <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#ff6b00', borderBottom: '2px solid #333' }}>
                                <th style={{ padding: '10px' }}>Token</th>
                                <th>Student Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queue.map((s, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{s.token}</td>
                                    <td>{s.name || s.studentName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;