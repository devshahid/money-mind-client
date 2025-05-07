import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUserData {
    _id: string | null;
    accessToken: string | null;
    role: string | null;
    fullName: string | null;
    email: string | null;
}
interface AuthState {
    userData: IUserData;
}

export interface IAuthenticationApiResponse {
    _id: string;
    role: string;
    email: string;
    settings: { monthlyReminder: boolean };
    createdAt: Date;
    updatedAt: Date;
    accessToken: string;
    fullName: string;
}
const initialState: AuthState = {
    userData: {
        _id: null,
        accessToken: null,
        role: null,
        fullName: null,
        email: null,
    },
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<IAuthenticationApiResponse>) => {
            state.userData = action.payload;
        },
        logout: (state) => {
            state.userData = initialState.userData;
        },
        setUserData: (state, action: PayloadAction<Partial<IAuthenticationApiResponse>>) => {
            state.userData.fullName = action.payload.fullName ?? null;
            state.userData.email = action.payload.email ?? null;
            state.userData.role = action.payload.role ?? null;
        },
    },
});

export const { login, logout, setUserData } = authSlice.actions;
export default authSlice.reducer;
