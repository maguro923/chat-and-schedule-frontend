import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';
import { webSocketService } from '../api/websocket';

interface WebSocketState {
    isConnected: boolean;
    latestMessage: any | null;
    error: string | null;
}

const initialState: WebSocketState = {
    isConnected: false,
    latestMessage: null,
    error: null,
};

export const connectWebSocket = createAsyncThunk<void, { user_id: string; headers: { [key: string]: string } }, { dispatch: AppDispatch, state: RootState }>(
    'webSocket/connect',
    async ({ user_id, headers }, { dispatch }) => {
        await webSocketService.connect(user_id, headers)
            .then(() => {
                dispatch(connectionEstablished());
            })
            .catch((error) => {
                dispatch(setError('WebSocket connection error: ' + error));
            });
    }
);

export const disconnectWebSocket = () => (dispatch:any) => {
    webSocketService.disconnect();
    dispatch(connectionClosed());
};

export const sendWebSocketMessage = createAsyncThunk<void, any, { dispatch: AppDispatch, state: RootState }>(
    'webSocket/sendMessage',
    async (data, thunkAPI) => {
        try {
            const response = await webSocketService.sendRequest(data);
            return response;
        } catch (error) {
            thunkAPI.dispatch(setError('Failed to send WebSocket message: ' + String(error)));
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

const webSocketSlice = createSlice({
    name: 'webSocket',
    initialState,
    reducers: {
        connectionEstablished(state) {
            state.isConnected = true;
        },
        connectionClosed(state) {
            state.isConnected = false;
        },
        receiveMessage(state, action: PayloadAction<any>) {
            state.latestMessage = action.payload;
        },
        setError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
    },
});

export const {
    connectionEstablished,
    connectionClosed,
    receiveMessage,
    setError,
} = webSocketSlice.actions;

export default webSocketSlice.reducer;