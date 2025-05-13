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
            let fullName;
            if (action.payload.fullName) {
                const fullNameArr = action.payload.fullName.split(" ");
                if (Array.isArray(fullNameArr) && fullNameArr.length > 1) {
                    const firstName = fullNameArr[0].charAt(0).toUpperCase() + fullNameArr[0].slice(1);
                    const lastName = fullNameArr[1].charAt(0).toUpperCase() + fullNameArr[1].slice(1);
                    fullName = `${firstName} ${lastName}`;
                } else fullName = action.payload.fullName.charAt(0).toUpperCase() + action.payload.fullName.slice(1);
            }
            state.userData.fullName = fullName ?? null;
            state.userData.email = action.payload.email ?? null;
            state.userData.role = action.payload.role ?? null;
            state.userData.accessToken = action.payload.accessToken ?? null;
            state.userData._id = action.payload._id ?? null;
        },
    },
});

export const { login, logout, setUserData } = authSlice.actions;
export default authSlice.reducer;
