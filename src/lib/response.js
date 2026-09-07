function ok(data) {
    return {
        status: 200,
        statusText: '200 OK',
        data
    };
}

function created(data) {
    return {
        status: 201,
        statusText: '201 CREATED',
        data
    };
}

function noContent() {
    return {
        status: 204,
        statusText: '204 NO CONTENT'
    };
}

function badRequest(error) {
    return {
        status: 400,
        statusText: '400 BAD REQUEST',
        error: String(error)
    };
}

function internalError(error) {
    return {
        status: 500,
        statusText: '500 INTERNAL SERVER ERROR',
        error: String(error)
    };
}

module.exports = {
    ok,
    created,
    noContent,
    badRequest,
    internalError
};
