import RestClient from "../framework/RestClient";
import GetCurrentUserResponse from "./data/GetCurrentUserResponse";

class IAMService {
    static login(email, password) {
        let obj = {email: email, password: password};
        return RestClient.post('/api/login', obj);
    }

    static getCurrentUser() {
        return RestClient.get("currentUser").then((response) => {
            if (response.status === 200) {
                return GetCurrentUserResponse.success(response.body);
            } else {
                return GetCurrentUserResponse.failed();
            }
        });
    }
}

export default IAMService;
