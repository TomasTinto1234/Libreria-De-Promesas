"use strict";

/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:
function $Promise(executor) {
  this._state = "pending";
  //this._value = undefined
  this._handlerGroups = [];

  if (typeof executor !== "function") {
    throw new TypeError("Error executor function");
  }
  executor(this._internalResolve.bind(this), this._internalReject.bind(this));
}
$Promise.prototype._internalResolve = function (value) {
  if (this._state === "pending") {
    this._state = "fulfilled";
    this._value = value;
    this._callHandlers();
  }
};
$Promise.prototype._internalReject = function (value) {
  if (this._state === "pending") {
    this._state = "rejected";
    this._value = value;
    this._callHandlers();
  }
};

$Promise.prototype.then = function (successCb, errorCb) {
  const downstreamPromise = new $Promise(() => {});
  this._handlerGroups.push({
    successCb: typeof successCb === "function" ? successCb : false,
    errorCb: typeof errorCb === "function" ? errorCb : false,
    downstreamPromise,
  });

  this._callHandlers();
  return downstreamPromise;
};
$Promise.prototype.catch = function (errorCb) {
  return this.then(null, errorCb);
};

$Promise.prototype._callHandlers = function () {
  if (this._state !== "pending") {
    while (this._handlerGroups.length) {
      const { successCb, errorCb, downstreamPromise } = this._handlerGroups.shift();
      if (this._state === "fulfilled") {
        if (successCb) {  
          try {
            const resutado = successCb(this._value);
            if (resutado instanceof $Promise) {
              resutado.then(
                (value) => downstreamPromise._internalResolve(value),
                (value) => downstreamPromise._internalReject(value)
              );
            } else {
              downstreamPromise._internalResolve(resutado);
            }
          } catch (err) {
            downstreamPromise._internalReject(err);
          }
        } else {
          downstreamPromise._internalResolve(this._value);
        }
      } else if (this._state === "rejected") {
        if (errorCb) {
          try {
            const resutado = errorCb(this._value);
            if (resutado instanceof $Promise) {
              resutado.then(
                (value) => downstreamPromise._internalResolve(value),
                (value) => downstreamPromise._internalReject(value)
              );
            } else {
              downstreamPromise._internalResolve(resutado);
            }
          } catch (err) {
            downstreamPromise._internalReject(err);
          }
        } else {
          downstreamPromise._internalReject(this._value);
        }
      }
    }
  }
};

module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
