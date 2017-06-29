/**
 * @file 简单的store
 * @author mj(zoumiaojiang@gmail.com)
 */


let store = {};

export default {


    /**
     * setter
     *
     * @param {string} name  store key
     * @param {any} value    store value
     */
    set(name, value) {
        store[name] = value;
    },


    /**
     * getter
     *
     * @param  {string} name  store key
     * @return {[type]}       store value
     */
    get(name) {
        return store[name];
    }
};
