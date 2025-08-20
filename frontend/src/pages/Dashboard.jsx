import React, { useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import config from '../config';
import search from '../assets/search4.svg';
import buttonImg from '../assets/send1.png';
import backButton from '../assets/back3.png';
import wall from '../assets/wall5.jpg';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import emojiImg from '../assets/emoji.png'


const socket = io('https://chatapp-wj9f.onrender.com', {
    withCredentials: true,
});

function Dashboard() {
    const [roomId, setRoomId] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchUserNumber, setSearchUserNumber] = useState('');
    const [myNumber, setMyNumber] = useState('');
    const [userNumber, setUserNumber] = useState('');
    const [senderId, setSenderId] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [myName, setMyName] = useState('');
    const [userName, setUserName] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate()
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiClick = (emojiData) => {
        setMessageInput(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    // Check for mobile view
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [filteredMessages]);

    // Initialize user data and socket connection
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user-info'));

        if (userData) {
            const userSnderID = userData.user.id;
            const number = userData.user.number;
            const name = userData.user.username;
            setMyName(name);
            setSenderId(userSnderID);
            setMyNumber(number);
            socket.emit('joinPersonalRoom', userSnderID);

            if (selectedContact) {
                socket.emit('joinRoom', {
                    senderId: userSnderID,
                    receiverId: selectedContact.id
                });
            }
        } else {
            navigate("/Login")
        }
    }, [selectedContact, navigate]);

    // Generate room ID when senderId or receiverId changes
    useEffect(() => {
        if (senderId && receiverId) {
            const generatedRoomId = [senderId, receiverId].sort().join('_');
            setRoomId(generatedRoomId);
            socket.emit('joinRoom', { senderId, receiverId });
        }
    }, [senderId, receiverId]);

    // Fetch contacts separately
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/contacts/${senderId}`);
                console.log('Contacts:', response.data);
                setContacts(response.data);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };

        if (senderId) {
            fetchContacts();
        }
    }, [senderId]);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/fetchmessages/${senderId}`);
                console.log('Messages:', response.data);
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        if (senderId) {
            fetchMessages();
        }
    }, [senderId]);

    // Handle incoming messages and status updates
    useEffect(() => {
        const handleIncomingMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);

            if (selectedContact &&
                ((msg.senderId === senderId && msg.receiverId === selectedContact.id) ||
                    (msg.senderId === selectedContact.id && msg.receiverId === senderId))) {
                setFilteredMessages(prev => [...prev, msg].sort((a, b) =>
                    new Date(a.timestamp) - new Date(b.timestamp)
                ));
            }

            if (msg.receiverId === senderId && msg.id) {
                socket.emit('markAsDelivered', {
                    messageId: msg.id,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                });
            }
        };

        const handleStatusUpdate = ({ messageId, status }) => {
            setMessages((prev) => {
                return prev.map(msg => {
                    if (msg.id === messageId) {
                        return { ...msg, status };
                    }
                    return msg;
                });
            });

            setFilteredMessages((prev) => {
                return prev.map(msg => {
                    if (msg.id === messageId) {
                        return { ...msg, status };
                    }
                    return msg;
                });
            });
        };

        const handleChatSeen = ({ senderId: seenSenderId, receiverId: seenReceiverId }) => {
            setMessages(prev => prev.map(msg => {
                if (msg.senderId === seenSenderId && msg.receiverId === seenReceiverId && msg.status !== 'seen') {
                    return { ...msg, status: 'seen' };
                }
                return msg;
            }));

            setFilteredMessages(prev => prev.map(msg => {
                if (msg.senderId === seenSenderId && msg.receiverId === seenReceiverId && msg.status !== 'seen') {
                    return { ...msg, status: 'seen' };
                }
                return msg;
            }));
        };

        socket.on('chatMessage', handleIncomingMessage);
        socket.on('updateMessageStatus', handleStatusUpdate);
        socket.on('chatSeen', handleChatSeen);

        return () => {
            socket.off('chatMessage', handleIncomingMessage);
            socket.off('updateMessageStatus', handleStatusUpdate);
            socket.off('chatSeen', handleChatSeen);
        };
    }, [senderId, selectedContact]);

    // Handle contact selection
    const handleSelectContact = useCallback((contact) => {
        console.log('Selected contact:', contact);

        if (!contact.id) {
            console.error('Contact ID is undefined!');
            return;
        }

        setSelectedContact(contact);
        setUserNumber(contact.number);
        setReceiverId(contact.id);
        setUserName(contact.username);

        if (isMobileView) setShowChat(true);

        const conversationMessages = messages
            .filter(msg =>
                (msg.senderId === senderId && msg.receiverId === contact.id) ||
                (msg.senderId === contact.id && msg.receiverId === senderId)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        setFilteredMessages(conversationMessages);
        socket.emit('joinRoom', { senderId, receiverId: contact.id });
        socket.emit('markChatAsSeen', { senderId: contact.id, receiverId: senderId });
    }, [messages, senderId, isMobileView]);

    // Search for user by number
    const handleSearchUserNumber = async () => {
        try {
            const res = await axios.post(`${config.apiUrl}/searchNumber`, {
                number: searchUserNumber,
            });
            const userData = res.data.userData;

            console.log('Found user:', userData);

            if (!userData || !userData.id) {
                throw new Error('User not found or missing ID');
            }

            setUserName(userData.username);
            setUserNumber(userData.number);
            setReceiverId(userData.id);

            const newContact = {
                id: userData.id,
                username: userData.username,
                number: userData.number
            };

            // Check if contact already exists
            const existingContact = contacts.find(c => c.id === userData.id);
            if (!existingContact) {
                setContacts(prev => [...prev, newContact]);
            }

            handleSelectContact(newContact);
        } catch (error) {
            console.error('Error searching user number:', error);
            alert('User not found or invalid user data');
        }
    };

    // Send a new message
    const handleSendMessage = async () => {
        if (!messageInput.trim()) return;

        if (!receiverId) {
            console.error('Receiver ID is missing!');
            alert('Please select a contact first');
            return;
        }

        try {
            const res = await axios.post(`${config.apiUrl}/sendMessages`, {
                senderId,
                receiverId,
                content: messageInput,
            });

            const messageId = res.data.messageId;

            const newMessage = {
                id: messageId,
                senderId,
                receiverId,
                content: messageInput,
                timestamp: new Date().toISOString(),
                status: 'sent',
                sender: {
                    id: senderId,
                    number: myNumber,
                    username: myName
                },
                receiver: {
                    id: receiverId,
                    number: userNumber,
                    username: userName
                }
            };

            setMessages(prev => [...prev, newMessage]);
            setFilteredMessages(prev => [...prev, newMessage].sort((a, b) =>
                new Date(a.timestamp) - new Date(b.timestamp)
            ));
            setMessageInput('');
            socket.emit('chatMessage', newMessage);
        } catch (err) {
            console.error('Error sending message:', err);
            if (err.response?.data?.error) {
                alert(err.response.data.error);
            }
        }
    };

    // Handle sending message on Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getTickIcon = (status) => {
        if (status === 'seen') {
            return <span className="text-blue-500 ml-1">✓✓</span>;
        }
        if (status === 'delivered') {
            return <span className="text-gray-600 ml-1">✓✓</span>;
        }
        return <span className="text-gray-500 ml-1">✓</span>;
    };

    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row">
            {/* Search Sidebar - Left - Hidden on mobile when chat is open */}
            <div className={`${isMobileView && showChat ? 'hidden' : 'flex'} w-full md:w-1/3 h-screen bg-white flex-col border-r border-gray-700`}>
                <div className="p-6 flex-shrink-0">
                    <h2 className="text-green-500 text-2xl font-bold mb-4">WhatsApp</h2>
                    <div className="flex items-center gap-2">
                        <input
                            className="w-full rounded-full p-2 px-4 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Search by phone number..."
                            value={searchUserNumber}
                            onChange={(e) => setSearchUserNumber(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchUserNumber()}
                        />
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-full"
                            onClick={handleSearchUserNumber}
                        >
                            <img src={search} alt="search" className="w-10 h-10" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
                    <div className="space-y-1 p-3 bg-gray-100 rounded-sm">
                        {contacts.map(contact => (
                            <div
                                key={contact.id}
                                className={`p-1 mx-2 rounded-lg cursor-pointer ${selectedContact?.id === contact.id ? 'bg-gray-400' : ''}`}
                                onClick={() => handleSelectContact(contact)}
                            >
                                <div className="text-black font-medium bg-white p-4 rounded-lg hover:bg-gray-300 transition-colors">
                                    <p className="font-bold">{contact.username}</p>
{/*                                     <p className="text-sm text-gray-600">{contact.number}</p> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Area - Right - Hidden on mobile when contacts are shown */}
            <div className={`${isMobileView && !showChat ? 'hidden' : 'flex'} w-full md:w-2/3 h-screen bg-black flex-col relative`}>
                {/* Wallpaper Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={wall}
                        className="w-full h-full object-cover opacity-80"
                        alt="Chat background"
                    />
                </div>

                {/* Chat Content (on top of wallpaper) */}
                <div className="relative z-10 flex flex-col h-full">
                    {selectedContact ? (
                        <>
                            <div className="p-4 border-b border-gray-700 flex-shrink-0 flex items-center bg-gray-950 bg-opacity-70">
                                {isMobileView && (
                                    <button
                                        onClick={() => setShowChat(false)}
                                        className="mr-2 p-1 rounded-full hover:bg-gray-700"
                                    >
                                        <img src={backButton} alt="Back" className="w-5 h-5" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-white text-xl font-bold">{selectedContact.username}</h2>
                                    <p className="text-gray-400 text-sm">{selectedContact.number}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
                                <div className="p-4 space-y-2">
                                    {filteredMessages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg break-words ${msg.senderId === senderId
                                                ? 'bg-emerald-800 ml-auto text-white'
                                                : 'bg-gray-600 text-white mr-auto'
                                                }`}
                                            style={{
                                                maxWidth: '70%',
                                                width: 'fit-content',
                                                minWidth: '120px',
                                            }}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content || msg.message}</p>
                                            <div className="text-xs flex justify-end items-center mt-1">
                                                <span className={msg.senderId === senderId ? "text-blue-200" : "text-gray-400"}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                {msg.senderId === senderId && getTickIcon(msg.status)}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-700 flex-shrink-0 bg-black bg-opacity-70">
                                <div className="relative">
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-16 left-0 z-20">
                                            <EmojiPicker
                                                onEmojiClick={handleEmojiClick}
                                                width={300}
                                                height={350}
                                                previewConfig={{ showPreview: false }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        >
                                            <img src={emojiImg} alt="Emoji"></img>
                                        </button>
                                        <input
                                            className="flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-700 text-white"
                                            type="text"
                                            placeholder="Type your message..."
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                        />
                                        <button
                                            className="w-10 h-10 transition-transform hover:scale-110"
                                            onClick={handleSendMessage}
                                        >
                                            <img src={buttonImg} alt="Send" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-400">
                                {isMobileView ? 'Select or search a contact to start chatting' : 'Select or search a contact from the sidebar'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
