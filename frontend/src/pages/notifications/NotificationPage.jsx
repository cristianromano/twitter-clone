import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/notification/${authUser?.user._id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "An error occurred");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/notification`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include", // Esto asegura que las cookies se envíen si usas cookies para la sesión
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "An error occurred");
        }
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Notificación eliminada");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotifications = () => {
    deleteNotification();
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notificaciones</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Borrar notificaciones</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications.notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">Sin notificaciones 🤔</div>
        )}
        {notifications.notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4">
              {notification.type === "follow" && (
                <FaUser className="w-7 h-7 text-primary" />
              )}
              {notification.type === "like" && (
                <FaHeart className="w-7 h-7 text-red-500" />
              )}
              <Link to={`/profile/${notification.from.username}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>{" "}
                  {notification.type === "follow"
                    ? "Te siguio"
                    : "Dio like a tu post"}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
