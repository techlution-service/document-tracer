// import util from 'util';
import DocumentTracerConfig from './DocumentTracerConfig.js';
import { RequestMalformed } from './DocumentTracerError/index.js';
import { CAR, DAR, UAR } from './DocumentTracerRequest/index.js';
import DocumentTracerResponse from './DocumentTracerResponse.js';
import { RESULT, HEADER, HASH } from './util.js';

/**
 * @typedef import('./DocumentTracerConfig.js')
 * .DocumentTracerConfigInput DocumentTracerConfigInput
 */
/**
 * @typedef import('./DocumentTracerError/index.js')
 * .DocumentTracerConfigError DocumentTracerConfigError
 */
/**
 * @typedef import('./DocumentTracerRequest/CreateApplicationRequest.js')
 * .CreateApplicationRequestInput CreateApplicationRequestInput
 */
/**
 * @typedef import('./DocumentTracerRequest/UpdateApplicationRequest.js')
 * .UpdateApplicationRequestInput UpdateApplicationRequestInput
 */
/**
 * @typedef import('./DocumentTracerRequest/DeleteApplicationRequest.js')
 * .DeleteApplicationRequestInput DeleteApplicationRequestInput
 */

export default class DocumentTracer {
  #applicationId;
  #config;
  #domain;
  #error;
  #key;
  #secret;
  #resource;
  #requestObject;
  #response;
  #result;
  #shouldFail = false;
  #url;

  /**
   * @param {DocumentTracerConfig|DocumentTracerConfigInput} config
   */
  constructor(config) {
    this.#config = DocumentTracer.#parseConfig(config);
    const { domain, secret, key } = this.#config;
    this.#domain = domain;
    this.#key = key;
    this.#secret = secret;
  }

  /**
   * @param {DocumentTracerConfig|DocumentTracerConfigInput} config
   * @returns {DocumentTracerConfig}
   */
  static #parseConfig(input) {
    if (input instanceof DocumentTracerConfig) return input;
    return new DocumentTracerConfig(input);
  }

  async #exec() {
    if (!this.#request) throw new RequestMalformed('Request content is not set');
    const { method, body } = this.#request;

    this.#response = await DocumentTracerResponse.handleResponse(
      fetch(this.#url, { headers: HEADER(this.#key), method, body }),
      this.#request instanceof CAR,
    );
    const { success, id: responseId, error } = this.#response;
    this.#result = success ? RESULT.SUCCESS : RESULT.FAIL;
    this.#applicationId = responseId;
    this.#error = error;
    if (this.#error) throw error;
  }

  #formatUrl() {
    return [this.#domain, 'admin', this.#resource, this.#request.constructor.checkId(this.#applicationId)]
      .filter(Boolean).join('/');
  }

  #parseRequest(RequestClass, input) {
    if (!this.#resource) throw new RequestMalformed('Resource is not set');
    this.#request = input instanceof RequestClass ? input : new RequestClass(input);
    return this;
  }

  /**
   * @function application
   * @param {string} [id]
   * @return {DocumentTracer}
   */
  application(id) {
    if (id) this.#applicationId = id;
    this.#resource = 'application';
    return this;
  }

  /** @return {DocumentTracer} */
  orFail() {
    this.#shouldFail = true;
    return this;
  }

  /**
   * @param {Object} payload
   * @returns {boolean}
   */
  verify(payload) { return HASH(payload, this.#secret); }
  /**
   * @param {?CreateApplicationRequest|CreateApplicationRequestInput} input
   * @returns {DocumentTracer}
   */
  create(input) { return this.#parseRequest(CAR, input); }
  /**
   * @param {?UpdateApplicationRequest|UpdateApplicationRequestInput} input]
   * @returns {DocumentTracer}
   */
  update(input) { return this.#parseRequest(UAR, input); }
  /**
   * @param {?DeleteApplicationRequest|DeleteApplicationRequestInput} input
   * @returns {DocumentTracer}
   */
  delete(input) { return this.#parseRequest(DAR, input); }

  /** @type {?string} */
  get applicationId() { return this.#applicationId; }
  /** @type {?DocumentTracerError[]|DocumentTracerError} */
  get error() { return this.#error; }
  /** @type {?string} */
  get result() { return this.#result; }
  /** @type {?string} */
  get response() { return this.#response; }
  /** @type {?string} */
  get config() { return this.#config; }
  /** @type {?string} */
  get request() {
    return { domain: this.#domain, url: this.#url, ...(this.#request?.valueOf() || {}) };
  }

  get #request() { return this.#requestObject; }
  set #request(input) {
    this.#requestObject = input;
    this.#url = this.#formatUrl();
  }

  /*
  [util.inspect.custom]() {
    return {
      error: this.#error,
      result: this.#result,
      applicationId: this.#applicationId,
      resource: this.#resource,
      url: this.#url,
      request: this.request,
      response: this.#response,
      config: this.#config,
    };
  }
  */

  /**
   * @callback DocumentTracerResolve
   * @param {DocumentTracerResponse} response
   */

  /**
   * @callback DocumentTracerReject
   * @param {DocumentTracerError} error
   */

  /**
   * @function then
   * @param {DocumentTracerResolve} resolve
   * @param {DocumentTracerReject} reject
   * @returns {DocumentTracerResolve|DocumentTracerRejcet}
   */
  async then(resolve, reject) {
    try {
      await this.#exec();
      return resolve(this.#response);
    } catch (e) {
      if (this.#error !== e) this.#error = e;
      return this.#shouldFail ? reject(this.#error) : resolve(this.#response);
    }
  }
}
