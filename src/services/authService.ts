import axiosClient from "./axiosClient";

export const loginUser = async (email: string, password: string) => {
    const response = await axiosClient.post("/user/login", { email, password });
    return response.data;
};

export const registerUser = async (email: string, password: string) => {
    const response = await axiosClient.post("/user/register", {
        email,
        password,
    });
    return response.data;
};

export const logoutUser = async () => {
    const response = await axiosClient.post("/user/logout");
    return response.data;
};
