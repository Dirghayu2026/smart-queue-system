import React, { useState, useEffect } from 'react';
import { db, messaging } from './firebase'; 
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';

const UserQueueManagement = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [purpose, setPurpose] = useState('Fees Payment');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!name) return;
        const q = query(collection(db, "queue"), where("studentName", "==", name), where("status", "==", "called"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const msg = new SpeechSynthesisUtterance();
                msg.text = `Attention ${name}, your turn has arrived. Please proceed to the counter for ${purpose}`;
                msg.lang = 'en-US';
                window.speechSynthesis.speak(msg);
                alert("तुमची वेळ आली आहे!");
            }
        });
        return () => unsubscribe();
    }, [name, purpose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const permission = await Notification.requestPermission();
            let fcmToken = "";
            if (permission === "granted") {
                fcmToken = await getToken(messaging, { 
                    vapidKey: 'BAhpMTCGUO5gOGc_QjRQ_1YIidhKIcZdH59Gm3F4MpY4yBS9N3K0NpnxqXtNF3BjhwXzAYNNikUe1uby4uRcoos' 
                });
            }
            await addDoc(collection(db, "queue"), {
                studentName: name,
                phoneNumber: phone,
                purpose: purpose,
                fcmToken: fcmToken,
                status: "waiting",
                timestamp: serverTimestamp()
            });
            alert("Success! Queue Joined.");
            setName(''); setPhone('');
        } catch (error) {
            alert("Error: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', minHeight: '100vh', background: '#f4f7f6' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px' }}>
                <h2 style={{ textAlign: 'center', color: '#1a73e8' }}>Student Portal</h2>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginTop: '10px' }}>Full Name</label>
                    <input style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} type="text" value={name} onChange={(e)=>setName(e.target.value)} required />
                    
                    <label style={{ display: 'block', marginTop: '10px' }}>Phone Number</label>
                    <input style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} type="text" value={phone} onChange={(e)=>setPhone(e.target.value)} required />

                    <label style={{ display: 'block', marginTop: '10px' }}>Purpose</label>
                    <select style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} value={purpose} onChange={(e)=>setPurpose(e.target.value)}>
                        <option value="Fees Payment">Fees Payment</option>
                        <option value="Document Submission">Document Submission</option>
                        <option value="Admission Inquiry">Admission Inquiry</option>
                        <option value="Scholarship">Scholarship</option>
                    </select>

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' }}>
                        {loading ? "Joining..." : "Join Queue"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserQueueManagement;