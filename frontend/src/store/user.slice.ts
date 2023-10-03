import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { BACK_PREFIX } from "../helpers/API";
import { AuthResponse } from "../interfaces/auth.interface";
import { Profile, UpdateUser } from "../interfaces/user.interface";
import { loadState } from "./storage";
import { store } from "./store";
//import { RootState } from './store';

export const JWT_PERSISTENT_STATE = "userToken";
export const EMAIL_PERSISTENT_STATE = "userEmail";
export const USERNAME_PERSISTENT_STATE = "userName";
export const USERID_PERSISTENT_STATE = "userId";
export const PROFILE_PERSISTENT_STATE = "userProfile";
const uri = "http://localhost:3000/auth/intra42";

export interface UserState {
	token: string | null;
	email?: string;
	//id42: string | null;
	authErrorMessage?: string;
	username?: string;
	userId: number | null;
	profile: Profile | null;
	profileError?: string;
	//registerError?: string;
}

const initialState: UserState = {
	token: loadState<string>(JWT_PERSISTENT_STATE) ?? null,
	email: loadState<string>(EMAIL_PERSISTENT_STATE) ?? "",
	username: loadState<string>(USERNAME_PERSISTENT_STATE) ?? "",
	userId: loadState<number | null>(USERID_PERSISTENT_STATE) ?? null,
	profile: loadState<Profile>(PROFILE_PERSISTENT_STATE) ?? null,
};

export const auth = createAsyncThunk("auth/login", async () => {
	try {
		const { data } = await axios.get<AuthResponse>(`${uri}`);
		console.log(data);
		return { data: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const getProfile = createAsyncThunk("/getProfile", async (id: number | null) => {
	try {
		const { data } = await axios.get<any>(`${BACK_PREFIX}/user/getProfile/${id}`);
		return { profile: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const updateProfile = createAsyncThunk("/updateProfile", async (params: UpdateUser) => {
	try {
		console.log("id:", params.id);
		const { data } = await axios.post<UpdateUser>(`${BACK_PREFIX}/user/updateProfile/${params.id}`, params);
		return data;
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		logout: (state) => {
			state.email = "";
			state.token = null;
			state.username = "";
			state.profile = null;
		},
		clearAuthError: (state) => {
			state.authErrorMessage = undefined;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(auth.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			state.userId = action.payload.data.id;
			state.token = action.payload.data.access_token;
			state.email = action.payload.email;
			state.username = action.payload.username;
		});
		builder.addCase(auth.rejected, (state, action) => {
			state.authErrorMessage = action.error.message;
			console.log(action.error);
		});
		builder.addCase(getProfile.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			state.profile = action.payload.profile;
			console.log(state.profile);
		});
		builder.addCase(getProfile.rejected, (state, action) => {
			state.authErrorMessage = action.error.message;
			console.log(action.error);
		});
		builder.addCase(updateProfile.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
		});
		builder.addCase(updateProfile.rejected, (state, action) => {
			state.profileError = action.error.message;
			console.log(action.error);
		});
	},
});

export default userSlice.reducer;
export const userActions = userSlice.actions;
