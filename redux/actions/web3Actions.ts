import { Dispatch } from "react";
import { AnyAction } from "redux";

export const load =
  (option: boolean) => async (dispatch: Dispatch<AnyAction>) => {
    dispatch({
      type: "",
    });
  };
