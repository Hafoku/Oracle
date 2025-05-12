import React from "react";
import { Link } from "react-router-dom";

export default function Buttons() {
  return (
    <div>
      <Link to="/user/login">
        <button>Войти</button>
      </Link>
      <Link to="/user/register">
        <button>Регистрация</button>
      </Link>
    </div>
  );
}
