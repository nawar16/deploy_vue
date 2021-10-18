import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios'
import { createFlashStore } from 'vuex-flash';
import jwtDecode from 'jwt-decode';

Vue.use(Vuex);
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('access_token');

export const store = new Vuex.Store({
    state: {
        token: localStorage.getItem('access_token') || null,
        mapdata: [],
        profile: { fname: null, lname: null, phone: null },
        driverData: { fname: null, lname: null, phone: null },
        travelsinfo: { kms: 0, travels: 0 },
        driver_qualification: 0,
        favorites: null,
        origin: [34.7324, 36.7137],
        destiny: [33.5138, 36.2765],
        fee_id: null,
        cost_per_km: 0,
        price_service: 0,
        destinyAndTime: [],
        firstTimeForAInterval: true,
        youllbeawoman: true
    },
    getters: {
        token: state => {
            return state.token;
        },
        loggedIn: state => {
            return state.token !== null;
        },
        profile: state => {
            return state.profile;
        },
        travelsinfo: state => {
            return state.travelsinfo;
        },
        mapdata: state => {
            return state.mapdata;
        },
        favorites: state => {
            return state.favorites;
        },
        origin: state => {
            return state.origin;
        },
        destiny: state => {
            return state.destiny;
        },
        fee_id: state => {
            return state.fee_id;
        },
        cost_per_km: state => {
            return state.cost_per_km;
        },
        price_service: state => {
            return state.price_service;
        },
        driver_qualification: state => {
            return state.driver_qualification;
        },
        destinyAndTime: state => {
            return state.destinyAndTime;
        },
        firstTimeForAInterval: state => {
            return state.firstTimeForAInterval;
        },
        youllbeawoman: state => {
            return state.youllbeawoman;
        },
        driverData: state => {
            return state.driverData;
        }
    },
    //synchronous mutiations 
    mutations: {
        tokenMutation: (state, token) => {
            state.token = token;
        },
        destroyToken: state => {
            state.token = null;
        },
        setProfile: (state, pro) => {
            state.profile = pro;
        },
        setTravelsinfo: (state, val) => {
            state.travelsinfo = val;
        },
        setFavorites: (state, fav) => {
            state.favorites = fav;
        },
        removeProfile: state => {
            state.profile = null;
        },
        setOrigin: (state, coor) => {
            state.origin = coor;
        },
        setDestiny: (state, coor) => {
            state.destiny = coor;
        },
        fee_id: (state, id) => {
            state.fee_id = id;
        },
        cost_per_km: (state, cost) => {
            state.cost_per_km = cost;
        },
        price_service: (state, price) => {
            state.price_service = price;
        },
        driver_qualification: (state, val) => {
            state.driver_qualification = val;
        },
        removeMapdata: state => {
            state.mapdata = [];
        },
        mapinfo: (state, data) => {
            state.mapdata = data;
        },
        destinyAndTime: (state, arr) => {
            state.destinyAndTime = arr;
            state.firstTimeForAInterval = !state.firstTimeForAInterval;
        },
        firstTimeForAInterval: (state) => {
            state.firstTimeForAInterval = !state.firstTimeForAInterval;
        },
        youllbeawoman: (state, value) => {
            state.youllbeawoman = value;
        },
        driverData: (state, data) => {
            state.driverData = data;
        }
    },
    //Asynchronous actions  
    actions: {
        api_register: (context, credentials) => {
            return new Promise((resolve, reject) => {
                axios.post('http://localhost:8010/api/signup', credentials)
                    .then(res => {
                        console.log(res.data.errors);
                        resolve(res);
                    })
                    .catch(err => {
                        //console.log(err);
                        reject(err);
                    })
            })
        },
        api_login: (context, credentials) => {
            return new Promise((resolve, reject) => {
                axios.post('http://localhost:8010/api/login', { phone: credentials.phone, password: credentials.password })
                    .then(res => {
                        const token = res.data.data._token;
                        localStorage.setItem('access_token', token);
                        context.commit('tokenMutation', token);
                        //console.log(jwtDecode(context.getters.token));
                        const { phone } = jwtDecode(context.getters.token)
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        logout: context => { //context store instance
            if (context.getters.loggedIn) {
                const token = localStorage.getItem('access_driver_token');
                context.commit('removeMapdata');
                localStorage.removeItem('access_token');
                context.commit('removeProfile');
                context.commit('destroyToken');
                return new Promise((resolve, reject) => {
                    axios.post('http://localhost:8010/api/driver/logout', { token: token })
                        .then(res => {
                            context.commit('removeMapdata');
                            localStorage.removeItem('access_token');
                            context.commit('removeProfile');
                            context.commit('destroyToken');
                            resolve(res);
                        })
                        .catch(err => {
                            reject(err);
                        })
                });
            }
        },
        profileInfo: context => {
            return new Promise((resolve, reject) => {
                const decoded = jwtDecode(context.getters.token);
                axios.post('http://localhost:8010/api/profile')
                    .then(res => {
                        context.commit('setProfile', res.data.data.profileInfo);
                        context.commit('setTravelsinfo', res.data.data.travelsInfo);

                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        updateProfileInfo: (context, newProfile) => {
            return new Promise((resolve, reject) => {
                const decoded = jwtDecode(context.getters.token);
                const object = { newProfile: newProfile, phone: decoded.phone }
                axios.post('http://localhost:8010/api/update-profile', object)
                    .then(res => {
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        changePassword: (context, obj) => {
            return new Promise((resolve, reject) => {
                const decoded = jwtDecode(context.getters.token);
                axios.post('http://localhost:8010/api/change-password', { phone: decoded.phone, pass: obj.new_pass })
                    .then(res => {
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        changePicture: (context, obj) => {
            return new Promise((resolve, reject) => {
                const decoded = jwtDecode(context.getters.token);
                axios.post('http://localhost:8010/api/change-pic', { phone: decoded.phone, pic: obj.new_pic })
                    .then(res => {
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        favoritesInfo: context => {
            return new Promise((resolve, reject) => {
                console.log('Favorites consulted');
                const decoded = jwtDecode(context.getters.token);
                axios.post('http://localhost:8010/api/profile/favorites', decoded)
                    .then(res => {
                        var data = res.data.data;
                        var array = []
                        for (var i in data) {
                            var fid = data[i].id;
                            var lat = data[i].geom.coordinates[0];
                            var lng = data[i].geom.coordinates[1];
                            var t = data[i].title;
                            array.push({ id: fid, title: t, coor: [lat, lng] });
                        }
                        context.commit('setFavorites', array);
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        sendNewFavorite: (context, item) => {
            return new Promise((resolve, reject) => {
                //console.log(context.getters.token);
                const decoded = jwtDecode(context.getters.token);
                // const phoneNumber = context.getters.profile.phone;
                const obj = { f_item: item, phone: decoded.phone };
                axios.post('http://localhost:8010/api/profile/new-favorite', obj)
                    .then(res => {
                        console.log(res.data);
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        deleteFavorite: (context, favID) => {
            return new Promise((resolve, reject) => {
                //console.log(context.getters.token);
                const decoded = jwtDecode(context.getters.token);
                const obj = { fav: favID, phone: decoded };
                axios.post('http://localhost:8010/api/profile/delete-favorite', obj)
                    .then(res => {
                        console.log(res.data);
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        updateFavorite: (context, obj) => {
            return new Promise((resolve, reject) => {
                //console.log(context.getters.token);
                const decoded = jwtDecode(context.getters.token);
                const object = { fav: obj.id, phone: decoded, newTitle: obj.newtitle };
                axios.post('http://localhost:8010/api/profile/update-favorite', object)
                    .then(res => {
                        console.log(res.data);
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        near: context => {
            axios.post('http://localhost:8010/api/near-taxi', { coordinates: context.getters.origin })
                .then(res => {
                    context.commit('driverData', res.data.data[0]);
                    context.commit('cost_per_km', res.data.data[0].price_km);
                    context.commit('fee_id', res.data.data[0].fee_id);
                    context.commit('driver_qualification', Math.round(res.data.data.avg_calls[0].avg));
                })
                .catch(err => {
                    console.log(err);
                })
        },
        service: context => {
            var obj = {
                'phone': jwtDecode(context.getters.token).phone,
                'driver_phone': context.getters.driverData.phone,
                'license_plate': context.getters.driverData.license_plate,
                'fee_id': context.getters.fee_id,
                'distance': context.getters.destinyAndTime[0],
                'time': context.getters.destinyAndTime[1],
                'price': context.getters.cost_per_km * context.getters.destinyAndTime[0],
                'qualification': null,
                'origin_coor': context.getters.origin,
                'destination_coor': context.getters.destiny
            };
            //console.log(obj);
            axios.post('http://localhost:8010/api/service-notification', obj)
                .then(res => {
                    console.log(res.data.msg);
                })
                .catch(err => {
                    console.log(err);
                })
        },
        doQualification: (context, qualification) => {
            return new Promise((resolve, reject) => {
                const decoded = jwtDecode(context.getters.token);
                const driverphone = context.getters.driverData.phone;
                const object = { phonecli: decoded.phone, phonedri: driverphone, qualification: qualification };
                axios.post('http://localhost:8010/api/service-qualification', object)
                    .then(res => {
                        console.log(res.data);
                        resolve(res);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        },
        infoMap: context => {
            axios.get('http://localhost:8010/api/map/info')
                .then(res => {
                    console.log(localStorage.getItem('access_token'));
                    console.log(res.data.data);
                    var data = res.data.data;
                    var array = []
                    for (var i in data) {
                        var lat = data[i].geom.coordinates[0];
                        var lng = data[i].geom.coordinates[1];
                        array.push({ coor: [lat, lng] });
                    }
                    //console.log(array);
                    context.commit('mapinfo', array);
                })
                .catch(err => {
                    console.log(err);
                })
        }
    },
    plugins: [
        createFlashStore()
    ]
})