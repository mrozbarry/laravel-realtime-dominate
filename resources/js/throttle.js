export const make = (milliseconds) => {
    let throttleHandle = null;
    return (value, fallback = null) => {
        if (!throttleHandle) {
            throttleHandle = setTimeout(() => {
                throttleHandle = null;
            }, milliseconds);
            return value;
        }
        return fallback;
    }
}
