import { ScanAction, ScanState } from "./types"

export const scanReducer = (
  state: ScanState,
  action: ScanAction
): ScanState => {
  switch (action.type) {
    case "GET_ANALYSES":
      return {
        ...state,
        scans: action.payload,
        isScansLoading: false,
        scansError: null,
      }
    case "GET_ANALYSES_ERROR":
      return {
        ...state,
        isScansLoading: false,
        scansError: action.payload,
      }
    case "GET_ANALYSES_LOADING":
      return {
        ...state,
        isScansLoading: action.payload,
      }
    default:
      return state
  }
}
