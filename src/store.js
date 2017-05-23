/**
 * @file 简单的store
 * @author mj(zoumiaojiang@gmail.com)
 */


const store = {};

export default {
    set(name, value) {
        store[name] = value;
    },


    get(name) {
        return store[name];
    }
};
