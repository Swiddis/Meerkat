import {Writable, writable} from "svelte/store";

export const loading: Writable<boolean> = writable(false);
export const loggedIn: Writable<boolean> = writable(false);

export const jwt = (() => {
    const {subscribe, set} = writable();

    let updateJWT = (val) => {
        if (val) {
            localStorage.setItem("jwt", val);
            loggedIn.set(true);
        } else {
            localStorage.removeItem("jwt");
            loggedIn.set(false);
        }
        return set(val);
    };

    return {
        subscribe,
        set: updateJWT,
        getUsername: () => parseJWT().sub,
        get: () => {
            let token = localStorage.getItem("jwt");
            updateJWT(token);
            return token;
        },
        reset: () => updateJWT(undefined)
    };
})();

export const parseJWT = () => {
    let token = getJWT();
    if (!token) return token;

    let payload = atob(token.split('.')[1]);
    let jwt = JSON.parse(payload);
    return jwt;
};

export const getJWT = () => {
    let token = jwt.get();
    if (!verifyJWT(token))
        jwt.reset();

    return token;
}
export const verifyJWT = (jwt = parseJWT()) => !!jwt && new Date(jwt.exp * 1000) > new Date(Date.now());
