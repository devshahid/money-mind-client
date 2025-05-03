export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("accessToken"); // or use a more secure check
};
