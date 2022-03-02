export const postEmail = (event, context) => {
    console.log("Message queued!");
    return {
        statusCode: 200,
        body: JSON.stringify({ status: "successful" }),
    };
};