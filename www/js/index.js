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

let dataDepartments = undefined;
let dataCities = undefined;

const BUTTONS = {
    login: document.querySelector("#btn-login"),
}

const eventSuscriptions = () => {
    ROUTER.addEventListener("ionRouteDidChange", navigate);
    BUTTONS.login.addEventListener("click", handleLogin)
}

const formatError = (error) => {
    return {
        status: error.codigo,
        message: error.mensaje,
    }
}

let loggedUser = undefined

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

const handleLogin = () => {
    const user = document.querySelector('#txtLoginEmail').value
    const password = document.querySelector('#txtLoginPassword').value
    login(user, password)
}

const login = (user, password) => {
    try {
        const data = {
            "usuario": user,
            "password": password,
        };

        fetch(API_DOC.login.url, {
            method: API_DOC.login.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Credenciales incorrectas');
                }
                return response.json();
            })
            .then(data => {
                loggedUser = data;
                localStorage.setItem("user", JSON.stringify(data));
                showScreen('home')
            })
            .catch(error => {
                console.error('Error:', error.message);
            });

    } catch (error) {
        console.log(error);
    }

    console.log(user, password);
}

const signup = (user, password, departmentId, cityId) => {

    try {
        const data = {
            "usuario": user,
            "password": password,
            "departamento": departmentId,
            "ciudad": cityId
        };

        fetch(API_DOC.signup.url, {
            method: API_DOC.signup.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al registrarse', response.status);
                }
                return response.json();
            })
            .then(user => {
                console.log('Usuario registrado:', user);
            })
            .catch(error => {
                console.error('Error:', error.message);
            });

    } catch (error) {
        console.log(error);
    }

    console.log(user, password, departmentId, cityId);
}

const showDepartments = () => {
    if (!dataDepartments) {
        getDepartments()
    } else {
        const departmentSelect = document.querySelector('#slcDepartment')
        let departmentsOptions = ''
        for (const department of dataDepartments) {
            departmentsOptions += `<ion-select-option value="${department.id}">${department.nombre}</ion-select-option>`
        }
        departmentSelect.innerHTML = departmentsOptions;
        departmentSelect.setAttribute('disabled', false)
        departmentSelect.addEventListener('ionChange', (event) => {
            dataCities = undefined;
            getCities(event.detail.value)
        })
    }
}

const getDepartments = () => {
    try {
        fetch(API_DOC.getDepartments.url, {
            method: API_DOC.getDepartments.method,
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Departamento no encontrado');
                }
                return response.json();
            })
            .then(data => {
                dataDepartments = data.departamentos
                showDepartments();
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    } catch (error) {
        console.log(error);
    }
}

const getCities = (cityId) => {
    try {
        fetch(API_DOC.getCities.url + cityId, {
            method: API_DOC.getCities.method,
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ciudad no encontrada');
                }
                return response.json();
            })
            .then(cities => {
                dataCities = cities.ciudades;
                showCities()
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    } catch (error) {
        console.log(error);
    }
}

const showCities = () => {
    const slcCities = document.querySelector('#slcCity')
    let citiesOptions = ''
    for (const city of dataCities) {
        citiesOptions += `<ion-select-option value="${city.id}">${city.nombre}</ion-select-option>`
    }
    slcCities.innerHTML = citiesOptions;
    slcCities.setAttribute('disabled', false)
}



const getSession = () => {
    const user = localStorage.getItem('user');
    if (user) {
        loggedUser = JSON.parse(user)
        showScreen('home')
    }
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
    if (SCREENS[screenid.toLocaleUpperCase()]) {
        hideScreens();
        SCREENS[screenid.toLocaleUpperCase()].style.display = 'block'
        switch (screenid) {
            case 'signup':
                showDepartments()
                break;

            default:
                break;
        }
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
getSession();
