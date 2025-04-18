import axios from "axios";
import React, { useEffect, useState, useRef, useMemo } from "react";
import SummaryApi, { backendDomain } from "../../../api/api";
import showToast from "../../ShowToast";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import io from "socket.io-client";
import { useChatSocket } from "../../../socketContext/socket";
import { MdImage } from "react-icons/md";

const TenantMessages = () => {
  const socket = useMemo(
    () => io(backendDomain, { withCredentials: true }),
    []
  );

  const userData = useSelector((state) => state.user.userData);
  const [clickedPerson, setClickedPerson] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);
  const [sending, setSending] = useState(false);

  const { messages, sendMessage, joinRoom, getAllMessages, uniquePersons } =
    useChatSocket();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Joining room
  useEffect(() => {
    if (!clickedPerson?.id) {
      return;
    }
    getAllMessages(userData._id, clickedPerson.id);
    joinRoom(userData._id, clickedPerson.id);
  }, [clickedPerson?.id]);

  // Handle sending a message

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();

    if (sending) {
      return;
    }

    setSending(true)

    let imageUrl = "";

    const formData = new FormData();
    try {
      if (image) {
        formData.append("image", image);
        const response = await axios.post(
          SummaryApi.uploadChatImage.url,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.status != 200) {
          console.log("Error occured while uploading image");
        }
        imageUrl = response.data.data;
        setImage(null)
      }

      setNewMessage((msg) => msg.trim());
      sendMessage(newMessage, imageUrl, userData._id, clickedPerson.id);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = (e) => {
    const image = e.target.files[0];
    if (image) {
      setImage(image);
    }
  };

  return (
    <div className=" bg-gray-100 h-full max-h-[100vh]">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 px-2">Messages</h1>

      <div className="flex border bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Sidebar - Users */}
        <div className="w-1/4 border-r bg-gray-50 p-4 overflow-y-auto h-[86vh] max-h-[100vh]">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          {loadingUsers ? (
            <p className="text-gray-500">Loading...</p>
          ) : uniquePersons.length > 0 ? (
            uniquePersons.map((person, index) => (
              <div
                key={index}
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition ${
                  clickedPerson?.id === person.userName
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() =>
                  setClickedPerson({
                    id: person.userId,
                    name: person.userName,
                  })
                }
              >
                <FaUserCircle className="text-2xl mr-3" />
                <div>
                  <h3 className="font-medium">{person.userName}</h3>
                  <p className="text-sm truncate">
                    {messages[messages.length - 1]?.message ||
                      person?.latestMessage ||
                      "sent a photo"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No users found.</p>
          )}
        </div>

        {/* Chat Window */}
        <div className="w-2/3 flex flex-col p-4">
          {/* Chat Header */}
          <div className="text-lg font-semibold mb-2 border-b pb-2">
            {clickedPerson ? clickedPerson.name : "Select a user to chat"}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto max-h-[520px] p-3 border bg-gray-50 rounded-lg">
            {loadingMessages ? (
              <p className="text-gray-500 text-center">Loading messages...</p>
            ) : messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex my-2 ${
                    msg.sender === userData._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div>
                    {msg.image && (
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs text-sm shadow rounded-xl${
                          msg.sender === userData._id
                        }`}
                      >
                        <img src={msg.image} alt="" className="rounded-mdw-[25rem] max-h-[25rem] h-[15rem] object-cover min-h-[10rem" />
                      </div>
                    )}
                    {msg.message && (
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs text-sm shadow ${
                          msg.sender === userData._id
                            ? "bg-blue-500 text-white "
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.message}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet</p>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Message Input */}
          {clickedPerson && (
            <form onSubmit={handleSend} className="flex border-t pt-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded-lg focus:outline-none"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                // onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="imageUpload"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="imageUpload"
                className="ml-2 bg-gray-300 text-gray-600 p-3 rounded-lg cursor-pointer hover:bg-gray-400"
              >
                <MdImage />
              </label>
              <button
                className={`ml-2 text-white p-3 rounded-lg hover:bg-blue-600 transition ${
                  sending ? " bg-red-500" : " bg-blue-500"
                }`}
                type="submit"
                disabled={sending}
              >
                <IoSend />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantMessages;
