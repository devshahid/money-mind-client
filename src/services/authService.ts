import axiosClient from "./axiosClient";

interface LoginResponse {
    output: {
        accessToken: string;
        role: string;
        email: string;
    };
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>("/user/login", { email, password });
    return response.data;
};

export const registerUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>("/user/register", {
        email,
        password,
    });
    return response.data;
};

export const logoutUser = async (): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>("/user/logout");
    return response.data;
};
