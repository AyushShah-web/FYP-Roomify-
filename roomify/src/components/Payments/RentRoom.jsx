import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import showToast from "../ShowToast";
import SummaryApi from "../../api/api";
import esewaImg from "../../images/esewa.png";
import khaltiImg from "../../images/khalti.png";

const RentRoom = () => {
  const { slug } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [roomPrice, setRoomPrice] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const fetchRoomDetails = async () => {
      try {
        // Fetch room details
        const roomResponse = await axios.get(
          `${SummaryApi.getRoomFromId.url}/${slug}`
        );
        if (!roomResponse.data?.data) {
          showToast("error", "Room not found");
          return;
        }
        setRoomData(roomResponse.data.data);

        // Fetch room price
        const priceResponse = await axios.get(
          `${SummaryApi.getRoomPrice.url}/${slug}`,
          { withCredentials: true }
        );
        setRoomPrice(priceResponse.data.data || 0);
      } catch (error) {
        console.error("Error fetching room details:", error);
        showToast("error", "Failed to load room details");
      }
    };

    fetchRoomDetails();
  }, [slug]);

  if (!roomData) {
    return (
      <h1 className="text-center text-white text-2xl mt-12">Room not found</h1>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 flex flex-col items-center">
      <div className="bg-white text-black p-6 lg:p-16 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 capitalize">{roomData.name}</h1>
        <img
          className="w-full md:w-[400px] h-[250px] object-cover rounded-lg shadow-xl mb-4"
          src={roomData.image || ""}
          alt={roomData.name || "Room Image"}
        />
        <p className="text-lg mb-2 capitalize">
          <strong>Location:</strong> {roomData.location}
        </p>
        <p className="text-lg mb-2 capitalize">
          <strong>Type:</strong> {roomData.type}
        </p>
        <p className="text-lg mb-2 capitalize">
          <strong>Owner:</strong> {roomData.owner?.name || "Unknown"}
        </p>
        <p className="text-lg mb-4 capitalize">
          <strong>Price:</strong> Rs {roomPrice}/month
        </p>
        <p className="text-sm text-gray-400">
          Posted on: {new Date(roomData.createdAt).toLocaleDateString("en-CA")}
        </p>

        <div className="payment-options mt-6">
          <h2 className="text-xl font-bold mb-3">Pay using:</h2>
          <div className="options flex gap-4">
            <img
              className="w-[10rem] rounded-xl p-2 border-2 cursor-pointer hover:shadow-md"
              src={esewaImg}
              alt="Esewa"
            />
            <img
              className="w-[10rem] rounded-xl p-2 border-2 cursor-pointer hover:shadow-md"
              src={khaltiImg}
              alt="Khalti"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <Link
            to={`/payment/${roomData._id}`}
            className="px-6 py-2 w-full min-w-[10rem] bg-primary hover:bg-primary/90 text-white font-semibold rounded-md text-center"
          >
            Rent It
          </Link>
        </div>
      </div>

      <ToastContainer />
    </section>
  );
};

export default RentRoom;
