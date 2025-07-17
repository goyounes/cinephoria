import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MessagesList = ({ messages }) => {
  if (messages.length === 0) {
    return <p>No messages found.</p>;
  }

  return (
    <div id="messageList">
      {messages.map((msg) => (
        <div
          key={msg.message_id || msg.id}
          className={`message-card ${msg.isRead ? '' : 'unread'}`}
          style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '5px' }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>From:</strong>{' '}
            <span>{msg.message_sender_name}</span>{' '}
            &lt;
            <a href={`mailto:${msg.message_sender_email}`}>{msg.message_sender_email}</a>
            &gt;
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Subject:</strong> {msg.message_subject}
          </div>
          <fieldset>
            <legend>Message</legend>
            <p style={{ marginTop: '0.3rem', lineHeight: 1.4 }}>{msg.message_text}</p>
          </fieldset>
        </div>
      ))}
    </div>
  );
};

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/admin/messages');
        console.log('Fetched messages:', response.data);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <main>
      <div className="container-half-center">
        <h1>Inbox</h1>
        <MessagesList messages={messages} />
      </div>
    </main>
  );
};

export default AdminMessages;
