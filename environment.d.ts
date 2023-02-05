declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      DB_URI: string;
      API_KEY_IMGBB: string;
      SECRET_KEY_TOKEN: string;
      CLIENT_ID_IMGUR: string;
      CLIENT_SECRET_IMGUR: string;
      REFRESH_TOKEN: string;
      ACCESS_TOKEN: string;
    }
  }
}
export {};
