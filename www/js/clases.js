class Usuario {
    constructor() {
        this.idUsuario = null;
        this.token = null;
    }

    static parse(data) {
        let instancia = new Usuario();

        if (data.idUsuario) {
            instancia.idUsuario = data.idUsuario;
        }
        if (data.token) {
            instancia.token = data.token;
        }

        return instancia;
    }
}

class Evento {
    constructor() {
        this.id = null;
        this.categoryId = null;
        this.categoryImageId = null;
        this.detail = null;
        this.date = null;
    }

    static parse(data) {
        let instancia = new Evento();

        if (data.id) {
            instancia.id = data.id;
        }
        if (data.idCategoria) {
            instancia.categoryId = data.idCategoria;
        }

        if(data.idCategoryImage) {
            instancia.categoryImageId = data.idCategoryImage;
        }

        if (data.detalle) {
            instancia.detail = data.detalle;
        }
        if (data.fecha) {
            instancia.date = data.fecha;
        }
        return instancia;
    }

    getCategoryImage() {
        return `img/${this.categoryImageId}.png`;
    }

    getEventDate() {
        const eventDate = this.date.split(' ')[0].split('-').reverse()
        eventDate[2].slice(2, 4)
        return eventDate;
    }

    getEventTime() {
        return this.date.split(' ')[1].split(':')
    }
}