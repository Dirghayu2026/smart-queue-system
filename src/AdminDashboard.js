import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc 
} from 'firebase/firestore';

const AdminDashboard = () => {
    const [queue, setQueue] = useState([]);

    // Real-time data fetch karne
    useEffect(() => {
        try {
            const q = query(collection(db, "queue"), orderBy("timestamp", "asc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setQueue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (error) => {
                console.error("Firestore Error:", error);
            });
            return () => unsubscribe();
        } catch (err) {
            console.error("Setup Error:", err);
        }
    }, []);

    // Student la bolavne
    const handleCallNext = async (id, name, token) => {
        if (!token) {
            alert("या Student कडे Notification Token नाहीये!");
            return;
        }

        try {
            // Firestore status update
            await updateDoc(doc(db, "queue", id), { status: "called" });

            // Backend API call
            const response = await fetch('http://localhost:5000/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    title: "तुमची वेळ आली आहे! 📢",
                    body: `नमस्कार ${name}, कृपया काउंटरवर या.`
                }),
            });

            if (response.ok) {
                alert(`${name} ला मेसेज पाठवला!`);
            } else {
                alert("Server Error: Notification गेली नाही.");
            }
        } catch (error) {
            console.error("Call Error:", error);
            alert("Technical Error!");
        }
    };

    // Remove Student
    const handleRemove = async (id) => {
        if (window.confirm("काढून टाकायचे का?")) {
            try {
                await deleteDoc(doc(db, "queue", id));
            } catch (err) {
                alert("Delete Error!");
            }
        }
    };

    // UI Styles
    const styles = {
        container: { padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' },
        table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
        th: { backgroundColor: '#1a73e8', color: 'white', padding: '12px', textAlign: 'left' },
        td: { padding: '12px', borderBottom: '1px solid #ddd' },
        btnCall: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        btnRemove: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
        badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#1a73e8' }
    };

    return (
        <div style={styles.container}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Admin Dashboard</h1>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Sr.</th>
                            <th style={styles.th}>Student Name</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Purpose</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queue.map((student, index) => (
                            <tr key={student.id} style={{ backgroundColor: student.status === 'called' ? '#f1f8e9' : 'white' }}>
                                <td style={styles.td}>{index + 1}</td>
                                <td style={styles.td}><strong>{student.studentName}</strong></td>
                                <td style={styles.td}>{student.phoneNumber}</td>
                                <td style={styles.td}><span style={styles.badge}>{student.purpose}</span></td>
                                <td style={styles.td}>{student.status}</td>
                                <td style={styles.td}>
                                    {student.status === 'waiting' && (
                                        <button 
                                            onClick={() => handleCallNext(student.id, student.studentName, student.fcmToken)}
                                            style={styles.btnCall}
                                        >
                                            Call
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleRemove(student.id)}
                                        style={styles.btnRemove}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {queue.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px' }}>Queue रिकामी आहे.</p>}
        </div>
    );
};

export default AdminDashboard;