
import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import { auth, database } from '../../firebase';
import {
    LOGIN_USER,
    REGISTER_USER,
    LOGOUT_USER,
    FORGOT_PASSWORD
} from 'Constants/actionTypes';
import 'firebase/auth'
import 'firebase/firestore'


import {
    loginUserSuccess,
    registerUserSuccess
} from './actions';

const loginWithEmailPasswordAsync = async (email, password) => {
    let result
    await auth.signInWithEmailAndPassword(email, password)
        .then(async (authUser) => {
            const { uid } = authUser.user.toJSON()
            await database.collection('ADMIN').doc(uid)
                .get()
                .then(admin => {
                    if (admin.exists) {
                        result = authUser
                    } else {
                        result = {
                            message: 'User is not admin'
                        }
                    }
                })
                .catch(error => result = error)

        })
        .catch(error => result = error);

    return result

}

function* loginWithEmailPassword({ payload }) {
    const { email, password } = payload.user;
    const { history } = payload;

    try {
        const loginUser = yield call(loginWithEmailPasswordAsync, email, password);
        if (!loginUser.message) {
            localStorage.setItem('user_id', loginUser.user.uid);
            yield put(loginUserSuccess(loginUser));
            history.push('/');
        } else {
            // catch throw
            console.log('login failed :', loginUser.message)
        }
    } catch (error) {
        // catch throw
        console.log('login error : ', error)
    }
}

const registerWithEmailPasswordAsync = async (email, password) =>
    await auth.createUserWithEmailAndPassword(email, password)
        .then(authUser => authUser)
        .catch(error => error);

function* registerWithEmailPassword({ payload }) {
    const { email, password } = payload.user;
    const { history } = payload
    try {
        const registerUser = yield call(registerWithEmailPasswordAsync, email, password);
        if (!registerUser.message) {
            localStorage.setItem('user_id', registerUser.user.uid);
            yield put(registerUserSuccess(registerUser));
            history.push('/')
        } else {
            // catch throw
            console.log('register failed :', registerUser.message)
        }
    } catch (error) {
        // catch throw
        console.log('register error : ', error)
    }
}



const logoutAsync = async (history) => {
    await auth.signOut().then(authUser => authUser).catch(error => error);
    history.push('/')
}

function* logout({ payload }) {
    const { history } = payload
    try {
        yield call(logoutAsync, history);
        localStorage.removeItem('user_id');
    } catch (error) {
    }
}

function* forgotPassword({ payload }) {
    const { user } = payload
    try {
        auth.sendPasswordResetEmail(user).then(function () {
           console.log('email sent')
        }).catch(function (error) {
           console.log(error)
        });
    } catch (error) {

    }

}

export function* watchRegisterUser() {
    yield takeEvery(REGISTER_USER, registerWithEmailPassword);
}

export function* watchLoginUser() {
    yield takeEvery(LOGIN_USER, loginWithEmailPassword);
}

export function* watchLogoutUser() {
    yield takeEvery(LOGOUT_USER, logout);
}

export function* watchResetPassword() {
    yield takeEvery(FORGOT_PASSWORD, forgotPassword)
}
export default function* rootSaga() {
    yield all([
        fork(watchLoginUser),
        fork(watchLogoutUser),
        fork(watchRegisterUser),
        fork(watchResetPassword)
    ]);
}