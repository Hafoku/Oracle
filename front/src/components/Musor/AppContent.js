import * as React from "react";
import AuthContent from "./AuthContent";
import LoginForm from "../LoginForm";
import WelcomeContent from "../WelcomeContent";
import { request } from "../../axios_helper";
import RegistrationForm from "../RegistrationForm";
import Buttons from "./Buttons";

export default class AppContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            componentToShow: "welcome",
        };
    }

    register = () => {
        this.setState({ componentToShow: "register" });
    };

    // Переходим на форму логина
    login = () => {
        this.setState({ componentToShow: "login" });
    };

    // Выход из системы (очищаем токен и возвращаемся на welcome)
    logout = () => {
        localStorage.removeItem("jwtToken"); // Удаляем токен при выходе
        this.setState({ componentToShow: "welcome" });
    };


    render() {
        console.log("AppContent рендерится, onLogin:", this.onLogin);
        return (
            <div>
                {/* Кнопки для перехода на логин и логаут */}
                <Buttons login={this.login} logout={this.logout} register={this.register} />


                {/* Welcome-страница (до логина) */}
                {this.state.componentToShow === "welcome" && <WelcomeContent />}

                {/* Контент для авторизованных пользователей */}
                {this.state.componentToShow === "messages" && <AuthContent />}

                {/* Форма логина */}
                {this.state.componentToShow === "login" && (
                    <LoginForm onLogin={this.onLogin} />
                )}
                        <div>
            {this.state.componentToShow === "register" && <RegistrationForm />}
        </div>
            </div>
        );
    }
}