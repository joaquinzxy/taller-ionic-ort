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

const listEventsTodayIon = document.querySelector("#list-events-today");
const listEventsPastIon = document.querySelector("#list-events-past");
const plazass = document.querySelector("#pantalla-plazas-combo-plazas");
const pantallaPlazas = document.querySelector("#pantalla-plazas");
const registro = document.querySelector("#page-registro");

let posicionUsuario = {
    latitude: -34.903816878014354,
    longitude: -56.19059048108193
};


let dataDepartments = undefined;
let dataCities = undefined;
let dataEvents = undefined;
let dataCategories = undefined;
let dataPlaces = undefined;
let map = null;
let loggedUser = null;

const BUTTONS = {
    login: document.querySelector("#btn-login"),
    addEvent: document.querySelector("#btn-add-event"),
}

// API CALLS

const getEvents = () => {

    listEventsTodayIon.innerHTML = `
        <ion-item class="spinner-load" lines="none">
            <ion-spinner color="primary" name="circular"></ion-spinner>
        </ion-item>`;

    listEventsPastIon.innerHTML = ``;

    try {
        fetch(API_DOC.getEvents.url + loggedUser.id, {
            headers: getHeader()
        })
            .then(response => response.json())
            .then(data => {
                if (data.codigo === 401) {
                    showAlert({
                        title: 'Error de sesión',
                        message: 'Ocurrion un error de autenticación, por favor, inicia sesión nuevamente',
                        buttons: ['Aceptar']
                    })

                    logOut()
                } else if (data.codigo !== 200) {
                    showAlert({
                        title: 'Error al obtener eventos',
                        message: mensaje,
                        buttons: ['Aceptar']
                    })
                } else {
                    dataEvents = data.eventos;
                    showEvents();
                    showDashboard();
                }
            });
    } catch (error) {
        showToast({ title: 'Error al obtener eventos', message: error.message, type: 'error' })
    }
}

const addEvent = (category, detail, datetime) => {
    try {
        if (!category || !datetime) {
            showToast({
                title: 'Error al agregar evento',
                message: 'Por favor, selecciona una categoría y una fecha',
                type: 'error'
            })
        } else {
            fetch(API_DOC.addEvent.url, {
                method: API_DOC.addEvent.method,
                headers: getHeader(),
                body: JSON.stringify({
                    idCategoria: category,
                    idUsuario: loggedUser.id,
                    detalle: detail,
                    fecha: datetime || ""
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.codigo === 401) {
                        logOut()
                    } else if (data.codigo !== 200) {
                        showToast({ title: 'Error al agregar evento', message: data.mensaje, type: 'error' })
                    } else {
                        dataEvents = undefined;
                        getEvents();
                    }
                }).catch(error => {
                    showToast({ title: 'Error al agregar evento', message: error.message, type: 'error' })
                });
        }
    } catch (error) {
        showToast({ title: 'Error al agregar evento', message: error.message, type: 'error' })
    }
}

const deleteEvent = (eventId) => {
    fetch(API_DOC.deleteEvent.url + eventId, {
        method: API_DOC.deleteEvent.method,
        headers: getHeader()
    })
        .then(response => response.json())
        .then(data => {
            if (data.codigo === 401) {
                showAlert({
                    title: 'Error de sesión',
                    message: 'Ocurrion un error de autenticación, por favor, inicia sesión nuevamente',
                    buttons: ['Aceptar']
                })
                logOut()
            } else if (data.codigo !== 200) {
                showToast({ title: 'Error al eliminar evento', message: data.mensaje, type: 'error' })
            } else {
                showToast({ title: 'Evento eliminado', message: 'El evento ha sido eliminado correctamente', type: 'success' })
                dataEvents = undefined;
                getEvents();
            }
        });
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
                return response.json();
            })
            .then(data => {
                if (data.codigo === 401) {
                    showAlert({
                        title: 'Error de sesión',
                        message: 'Ocurrion un error de autenticación, por favor, inicia sesión nuevamente',
                        buttons: ['Aceptar']
                    })
                    logOut()
                } else if (data.codigo !== 200) {
                    showAlert({
                        title: 'Error al obtener los departamentos',
                        message: data.mensaje,
                        buttons: ['Aceptar']
                    })
                } else {
                    dataDepartments = data.departamentos
                    showDepartments();
                }
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    } catch (error) {
        showToast({ title: 'Error al obtener departamentos', message: error.message, type: 'error' })
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
                return response.json();
            })
            .then(cities => {
                if (cities.codigo === 401) {
                    showAlert({
                        title: 'Error de sesión',
                        message: 'Ocurrion un error de autenticación, por favor, inicia sesión nuevamente',
                        buttons: ['Aceptar']
                    })
                    logOut()
                } else if (cities.codig !== 200) {
                    showAlert({
                        title: 'Error al obtener las ciudades',
                        message: cities.mensaje,
                        buttons: ['Aceptar']
                    })
                }
                else {
                    dataCities = cities.ciudades;
                    showCities()
                }
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    } catch (error) {
        showToast({ title: 'Error al obtener ciudades', message: error.message, type: 'error' })
    }
}

const getPlaces = () => {
    fetch(API_DOC.getPlaces.url, {
        method: API_DOC.getPlaces.method,
        headers: getHeader(),
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.codigo === 401) {
                showAlert({
                    title: 'Error de sesión',
                    message: 'Ocurrion un error de autenticación, por favor, inicia sesión nuevamente',
                    buttons: ['Aceptar']
                })
                logOut()
            } else if (data.codigo !== 200) {
                mostrarToast('ERROR', 'Error', 'No se han encontado plazas');
            } else {
                dataPlaces = data.plazas;
            }
        })
        .catch(error => {
            showToast({ title: 'Error al obtener plazas', message: error.message, type: 'error' })
        });
}

const getCategories = () => {
    try {
        fetch(API_DOC.getCategories.url, {
            method: API_DOC.getCategories.method,
            headers: getHeader()
        })
            .then(response => response.json())
            .then(data => {
                if (data.codigo === 401) {
                    showAlert({
                        title: 'Error de sesión',
                        message: 'Ocurrion un error de autenticación, por favor, inicia sesión nuevamente',
                        buttons: ['Aceptar']
                    })

                    logOut()
                } else if (data.codigo !== 200) {
                    showAlert({
                        title: 'Error al obtener las categorías',
                        message: data.mensaje,
                        buttons: ['Aceptar']
                    })
                } else {
                    dataCategories = data.categorias
                    showCategories();
                }
            })
            .catch(error => {
                showToast({ title: 'Error al obtener categorías', message: error.message, type: 'error' })
            });
    } catch (error) {
        showToast({ title: 'Error al obtener categorías', message: error.message, type: 'error' })
    }
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
                } else {
                    usuarioLogueado = true;
                }
                return response.json();
            })
            .then(data => {
                loggedUser = data;
                localStorage.setItem("user", JSON.stringify(data));
                showMenuByUser(loggedUser);
                showScreen('home')
            })
            .catch(error => {
                console.error('Error:', error.message);
            });

    } catch (error) {
        showToast({ title: 'Error al iniciar sesión', message: error.message, type: 'error' })
    }
}

const signup = (user, password, departmentId, cityId) => {

    try {
        const data = {
            "usuario": user,
            "password": password,
            "idDepartamento": departmentId,
            "idCiudad": cityId
        };

        fetch(API_DOC.signup.url, {
            method: API_DOC.signup.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)

        })
            .then(response => {
                return response.json();

            })
            .then(user => {
                if (user.codigo != 200) {
                    showAlert({ title: "Error al registrar usuario", message: user.mensaje, buttons: ["OK"] });
                } else {
                    NAV.push("page-login");
                    showMenuByUser(loggedUser);
                    closeMenu();

                }

            })
            .catch(error => {
                console.error('Error:', error.message);
            });

    } catch (error) {
        showToast({ title: 'Error al registrar usuario', message: error.message, type: 'error' })
    }
}

// END API CALLS

// NAVIGATION 

const SCREENS = {
    HOME: document.querySelector('#page-home'),
    EVENTS: document.querySelector('#page-events'),
    DASHBOARD: document.querySelector('#page-dashboard'),
    PLACES: document.querySelector('#page-places'),
    LOGIN: document.querySelector('#page-login'),
    SIGNUP: document.querySelector('#page-auth'),
}

const hideScreens = () => {
    SCREENS.HOME.style.display = 'none'
    SCREENS.EVENTS.style.display = 'none'
    SCREENS.LOGIN.style.display = 'none'
    SCREENS.SIGNUP.style.display = 'none'
    SCREENS.DASHBOARD.style.display = 'none'
    SCREENS.PLACES.style.display = 'none'
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
            case 'events':
                showEvents()
                break;

            case 'places':
                initMap();

            case 'dashboard':
                showDashboard()

            default:
                break;
        }
    }
}

const closeMenu = () => {
    MENU.close();
}

const showMenuByUser = (loggedUser) => {
    document.querySelector('#menu-options-guest').style.display = 'none';
    document.querySelector('#menu-options-logued').style.display = 'none';
    if (loggedUser) {
        document.querySelector('#menu-options-logued').style.display = 'block';
    } else {
        document.querySelector('#menu-options-guest').style.display = 'block';
    }
}

const navigate = (evt) => {

    const guestPages = ['login', 'signup', 'home'];
    const privatePages = ['events', 'dashboard', 'places', 'home'];

    const target = evt.detail.to === '/' ? 'home' : evt.detail.to;

    hideScreens();
    if (!loggedUser && privatePages.includes(target.replace('/', ''))) {
        showScreen('login');
    } else if (loggedUser && guestPages.includes(target.replace('/', ''))) {
        showScreen('events');
    } else {
        showScreen(target);
    }

}

// END NAVIGATION

// UTILS

const getHeader = () => {
    return {
        'Content-Type': 'application/json',
        'apikey': loggedUser?.apiKey,
        'iduser': loggedUser?.id
    }
}

const getSession = () => {
    const user = localStorage.getItem('user');
    if (user) {
        loggedUser = JSON.parse(user)
        getCategories();
        showScreen('home')
    }
}

const getSinceTime = (date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diff = today - eventDate;
    const diffSeconds = diff / 1000;
    const diffMinutes = diffSeconds / 60;
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;
    const diffMonths = diffDays / 30;

    if (diffMonths > 1) {
        return `${Math.floor(diffMonths)} ${Math.floor(diffMonths) > 1 ? 'meses' : 'mes'}`
    } else if (diffDays > 1) {
        return `${Math.floor(diffDays)} ${Math.floor(diffDays) > 1 ? 'días' : 'día'}`
    } else if (diffHours > 1) {
        return `${Math.floor(diffHours)} ${Math.floor(diffHours) > 1 ? 'horas' : 'hora'}`
    } else if (diffMinutes > 1) {
        return `${Math.floor(diffMinutes)} ${Math.floor(diffMinutes) > 1 ? 'minutos' : 'minuto'}`
    } else {
        return `${Math.floor(diffSeconds)} ${Math.floor(diffSeconds) > 1 ? 'segundos' : 'segundo'}`
    }
}

const showToast = ({ title, message, type, duration }) => {
    const toast = document.createElement('ion-toast');
    toast.color = type === 'error' ? 'danger' : 'tertiary';
    toast.message = message || '';
    toast.header = title.toLocaleUpperCase() || '';
    toast.duration = duration || 2000;

    document.body.appendChild(toast);
    toast.present();
}

const showAlert = ({ title, message, buttons }) => {
    const alert = document.createElement('ion-alert');
    alert.header = title;
    alert.message = message;
    alert.buttons = buttons;

    document.body.appendChild(alert);
    alert.present();
}

const cleanUpToastsAlerts = () => {
    const toasts = document.querySelectorAll('ion-toast');
    toasts.forEach(toast => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    });

    const alerts = document.querySelectorAll('ion-alert');
    alerts.forEach(alert => {
        if (document.body.contains(alert)) {
            document.body.removeChild(alert);
        }
    });
}

const processEvents = () => {

    const today = new Date();
    today.setHours(today.getHours() - 3);
    const todayStr = today.toISOString().split('T')[0];

    const sortedEventsByFecha = dataEvents.sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha)
    })

    const events = sortedEventsByFecha.map(event => {
        return {
            ...event,
            moment: event.fecha.split(' ')[0] === todayStr ? 'today' : 'past'
        }
    });

    return events
}

const getCategoryImageId = (categoryId) => {
    if (!dataCategories) {
        getCategories();
        showEvents();
    } else {
        return dataCategories.find(category => category.id === categoryId).imagen
    }
}

const generateDashboardData = () => {
    const events = processEvents();
    const todayEvents = events.filter(event => event.moment === 'today');
    const idDaipers = dataCategories.find(category => category.tipo === 'Pañal').id;
    const idFeed = dataCategories.find(category => category.tipo === 'Biberón').id;

    const daipers = todayEvents.filter(event => event.idCategoria === idDaipers);
    const feed = todayEvents.filter(event => event.idCategoria === idFeed);

    return [{
        total: daipers.length,
        label: daipers.length === 1 ? 'Pañal' : 'Pañales',
        icon: '🩲',
        since: daipers.length > 0 ? getSinceTime(daipers[0].fecha) : 'Sin eventos'
    }, {
        total: feed.length,
        label: feed.length === 1 ? 'Biberón' : 'Biberones',
        icon: '🍼',
        since: feed.length > 0 ? getSinceTime(feed[0].fecha) : 'Sin eventos',
    }]
}

const logOut = () => {
    closeMenu();
    localStorage.clear();
    loggedUser = null;
    NAV.setRoot("page-login");
    NAV.popToRoot();
    showMenuByUser(loggedUser);
}

// END UTILS

// TRIGGERS AND EVENTS

const onDeleteEvent = (eventId) => {
    showAlert({
        title: 'Eliminar evento',
        message: '¿Estás seguro de eliminar el evento?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary'
            },
            {
                text: 'Eliminar',
                handler: () => {
                    deleteEvent(eventId)
                }
            }
        ]
    })
}

const onOpenModalAddEvent = () => {
    showCategories();

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const dateStr = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    const timeStr = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

    document.querySelector('#add-event-datetime').value = dateStr + 'T' + timeStr;
    document.querySelector('#add-event-datetime').max = dateStr + 'T' + timeStr;
    document.querySelector('#txtEventDetail').value = '';
    document.querySelector('#slcCategory').value = '';
}

const onChangeEventCategory = (event) => {
    const category = event.detail.value;
    const btnConfirmEvent = document.querySelector('#btn-confirm-event');
    if (category) {
        btnConfirmEvent.removeAttribute('disabled');
    } else {
        btnConfirmEvent.setAttribute('disabled', true);
    }
}

const handleLogin = () => {
    const user = document.querySelector('#txtLoginEmail').value
    const password = document.querySelector('#txtLoginPassword').value
    login(user, password)
}

const handleSignup = () => {
    const user = document.querySelector('#txtLoginEmail2').value
    const password = document.querySelector('#txtLoginPassword2').value
    const departmentId = document.querySelector('#slcDepartment').value
    const cityId = document.querySelector('#slcCity').value
    if (password.length >= 8 && user.indexOf("@") != -1) {
        signup(user, password, departmentId, cityId);
        showAlert({ title: "Usuario registrado" });
    } else {
        showAlert({ title: "Error de usuario o contraseña" });
    }

}

const onConfirmEvent = () => {
    const category = document.querySelector('#slcCategory').value;
    const detail = document.querySelector('#txtEventDetail').value;
    const datetime = document.querySelector('#add-event-datetime').value;
    addEvent(category, detail, datetime);
    closeModalAddEvent();
}

const eventSuscriptions = () => {
    ROUTER.addEventListener("ionRouteDidChange", navigate);
    BUTTONS.login.addEventListener("click", handleLogin);
    document.querySelector('#slcCategory').addEventListener('ionChange', onChangeEventCategory);
    document.querySelector("#btnMenuCerrarSesion").addEventListener("click", logOut);
    document.querySelector("#btnLoginIngresar").addEventListener("click", handleSignup);
}

const closeModalAddEvent = () => {
    const modal = document.querySelector('#add-event-modal-ion');
    return modal.dismiss();
}

// END TRIGGERS AND EVENTS

// DATA DISPLAY

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

const showCities = () => {
    const slcCities = document.querySelector('#slcCity')
    let citiesOptions = ''
    for (const city of dataCities) {
        citiesOptions += `<ion-select-option value="${city.id}">${city.nombre}</ion-select-option>`
    }
    slcCities.innerHTML = citiesOptions;
    slcCities.setAttribute('disabled', false)
}

const showEvents = () => {
    if (!dataEvents) {
        getEvents()
    } else {
        if (dataEvents.length === 0) {
            listEventsTodayIon.innerHTML = '<ion-item>Ningún evento registrado</ion-item>'
        } else {

            const events = processEvents();

            let todayEventContent = `<ion-list-header> <ion-label><h2><strong>Eventos de hoy</strong></h2></ion-label> </ion-list-header>`
            let pastEventContent = `<ion-list-header> <ion-label><h2><strong>Eventos pasados</strong></h2></ion-label> </ion-list-header>`
            for (const event of events) {
                const eventTime = event.fecha.split(' ')[1].split(':')
                const eventDate = event.fecha.split(' ')[0].split('-').reverse()
                eventDate[2] = eventDate[2].slice(2, 4)

                const eventContent = `
                <ion-item> 
                    <ion-grid>
                        <ion-row>
                            <ion-col size="1">
                                <ion-img src="https://babytracker.develotion.com/imgs/${getCategoryImageId(event.idCategoria)}.png"></ion-img>
                            </ion-col>
                            <ion-col size="9.5">
                                <ion-row>
                                    <p class="event-datetime">
                                        <span>${eventTime[0]}:${eventTime[1]} ${event.moment === 'today' ? '' : ' - ' + eventDate.join('/')}</span> <span class="event-since">${getSinceTime(event.fecha)} atrás</span>
                                    </p>
                                </ion-row>
                                <ion-row>
                                    <ion-label><p class="event-detalle">${event.detalle || 'Sin detalle'}</p></ion-label>
                                </ion-row>
                            </ion-col>
                            <ion-col size="1">
                                <ion-button color="primary"  fill="clear"  shape="round" onclick="onDeleteEvent(${event.id})">
                                    <ion-icon name="trash" color="danger" fill="clear"></ion-icon>
                                </ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-item>`

                if (event.moment === 'today') {
                    todayEventContent += eventContent
                } else {
                    pastEventContent += eventContent
                }
            }
            listEventsTodayIon.innerHTML = todayEventContent;
            listEventsPastIon.innerHTML = pastEventContent;
        }
    }
}

const showCategories = () => {
    if (!dataCategories) {
        getCategories()
    } else {
        const slcCategories = document.querySelector('#slcCategory')
        let categoriesOptions = ''
        for (const category of dataCategories) {
            categoriesOptions += `<ion-select-option value="${category.id}">${category.tipo}</ion-select-option>`
        }
        slcCategories.innerHTML = categoriesOptions;
        slcCategories.setAttribute('disabled', false)
    }
}

const showDashboard = () => {
    if (!dataEvents) {
        getEvents();
    } else {
        const data = generateDashboardData();
        const dashboardContent = document.querySelector('#dashboard-content');
        let dashboardContentHTML = '';
        for (const item of data) {
            dashboardContentHTML += `
            <ion-item>
                <ion-label>
                    <h2 style="font-size: 2rem"><strong style="font-size: 3rem">${item.icon} ${item.total}</strong> ${item.label}</h2>
                    <p>${item.since}</p>
                </ion-label>
            </ion-item>`
        }
        dashboardContent.innerHTML = dashboardContentHTML;
    }
}

// END DATA DISPLAY

eventSuscriptions();
getSession();
showMenuByUser(loggedUser);

/* plazas */

const initMap = () => {
    if (!map) {
        map = L.map('mapa').setView([posicionUsuario.latitude, posicionUsuario.longitude], 18);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markerUsuario = L.marker([posicionUsuario.latitude, posicionUsuario.longitude], { icon: UserIcon }).addTo(map);
    }
}

const cargarPosicionUsuario = () => {
    if (Capacitor.isNativePlatform()) {
        const loadCurrentPosition = async () => {
            const resultado = await Capacitor.Plugins.Geolocation.getCurrentPosition({ timeout: 3000 });
            if (resultado.coords && resultado.coords.latitude) {
                posicionUsuario = {
                    latitude: resultado.coords.latitude,
                    longitude: resultado.coords.longitude
                }
            }
        };
        loadCurrentPosition();
    } else {
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                if (pos && pos.coords && pos.coords.latitude) {
                    posicionUsuario = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    };
                }
            },
            function (error) {
                console.log('error', error);
            });
    }
}
