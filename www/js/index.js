const API_BASE = 'https://babytracker.develotion.com';

const API_DOC = {
    signup: {
        url: API_BASE + '/usuarios.php',
        method: 'POST'
    },
    login: {
        url: API_BASE + '/login.php',
        method: 'POST'
    },
    getCategories: {
        url: API_BASE + '/categorias.php',
        method: 'GET'
    },
    getPlaces: {
        url: API_BASE + '/plazas.php',
        method: 'GET'
    },
    getDepartments: {
        url: API_BASE + '/departamentos.php',
        method: 'GET'
    },
    getCities: {
        url: API_BASE + '/ciudades.php?idDepartamento=',
        method: 'GET'
    },
    getEvents: {
        url: API_BASE + '/eventos.php?idUsuario=',
        method: 'GET'
    },
    addEvent: {
        url: API_BASE + '/eventos.php',
        method: 'POST'
    },
    deleteEvent: {
        url: API_BASE + '/eventos.php?idEvento=',
        method: 'DELETE'
    }
}

const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const NAV = document.querySelector("#nav");

const eventSuscriptions = () => {
    ROUTER.addEventListener("ionRouteDidChange", navigate);
}

const formatError = (error) => {
    return {
        status: error.codigo,
        message: error.mensaje,
    }
}

const user = {
    apiKey: 'c15838f4dec3e840d8d6e23122173361',
    id: 3644
}

const getHeader = () => {
    return {
        'Content-Type': 'application/json',
        'apikey': user.apiKey,
        'iduser': user.id
    }
}

const addEvent = (category, detail, datetime) => {
    try {

        if (!category || !detail) {
            throw {
                code: 500,
                message: 'Se necesita definir categoría y detalle'
            }
        }

        fetch(API_DOC.addEvent.url, {
            method: API_DOC.addEvent.method,
            headers: getHeader(),
            body: JSON.stringify({
                idCategoria: category,
                idUsuario: user.id,
                detalle: detail,
                fecha: datetime || ""
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.codigo !== 200) {
                    throw formatError(data);
                }
                console.log(data);
            }).catch(error => {
                console.log('Error:', error);
                throw error;
            });
    } catch (error) {
        console.log({ error });
    }
}

const getEvents = () => {
    fetch(API_DOC.getEvents.url + user.id, {
        headers: getHeader()
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
}

const deleteEvent = (eventId) => {
    fetch(API_DOC.deleteEvent.url + eventId, {
        method: API_DOC.deleteEvent.method,
        headers: getHeader()
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
}

const login = (user, password) => {
    // TODO YASY
    console.log(user, password);
}

const signup = (user, password, departmentId, cityId) => {
// TODO YASY
}

const getDepartments = () => {
// TODO YASY
}

const getCities = (departmentId) => {
// TODO YASY
}

const getSession = () => {
    // DEBE BUSCAR EN LOCAL STORAGE SI EXISTE INFO DEL USUARIO
    localStorage.getItem('user');
}

const SCREENS = {
    HOME: document.querySelector('#page-home'),
    EVENTS: document.querySelector('#page-events'),
    LOGIN: document.querySelector('#page-login'),
    SIGNUP: document.querySelector('#page-auth'),
}

const hideScreens = () => {
    SCREENS.HOME.style.display = 'none'
    SCREENS.EVENTS.style.display = 'none'
    SCREENS.LOGIN.style.display = 'none'
    SCREENS.SIGNUP.style.display = 'none'
}

const showScreen = (screenid) => {
    screenid = screenid.replace('/', '');
    if(SCREENS[screenid.toLocaleUpperCase()]){
        hideScreens();
        SCREENS[screenid.toLocaleUpperCase()].style.display = 'block'
    }
} 

const closeMenu = () => {
    MENU.close();
}

const navigate = (evt) => {
    const target = evt.detail.to === '/' ? 'home' : evt.detail.to;
    hideScreens();
    showScreen(target);
}

eventSuscriptions();
getSession()