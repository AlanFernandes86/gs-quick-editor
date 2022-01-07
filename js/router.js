
// https://developer.mozilla.org/pt-BR/docs/Web/API/Window/popstate_event
// https://developer.mozilla.org/pt-BR/docs/Web/API/EventTarget/dispatchEvent
// https://developer.mozilla.org/pt-BR/docs/Web/API/Window/DOMContentLoaded_event
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
// https://developer.mozilla.org/en-US/docs/Web/API/History/pushState

export class Router {

    constructor(routes) {
        this.routes = routes;
    }
    
    route(event) {
        event = event || window.event;
        event.preventDefault();
        window.history.pushState({}, '', event.target.href);
        this.handleLocation();
    }

    handleLocation(event) {
        // const path = window.location.pathname;
        // const route = this.routes[path] || this.routes[404];
        // const html = fetch(route).then((data) => data.text());
        console.log("aiaiai");
    }

}
