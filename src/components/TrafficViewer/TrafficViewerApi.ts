import { TargettingStatusPod } from "../../recoil/targettingStatus/index";

interface DataModel {
  representation: string;
}

export interface ResponseModel {
  data: DataModel;
  errorMessage: string;
}

type TrafficViewerApi = {
  validateQuery: (query: string) => Promise<{ valid: boolean, message: string }>
  targetStatus: () => TargettingStatusPod[]
  getItem: (id: string, query: string) => unknown,
  replayRequest: (request: { method: string, url: string, data: string, headers: unknown }) => Promise<ResponseModel>,
  webSocket: {
    close: () => void
  }
}

export default TrafficViewerApi
