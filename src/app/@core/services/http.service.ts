import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ObjectUtil } from '../utils/object.util';

export class InterceptorHttpParams extends HttpParams {
  constructor(public options: RequestOptions) {
    super({
      fromObject: options.params as {
        [param: string]: string | string[];
      },
    });
  }
}

export interface RequestOptions {
  data?: any;
  params?: { [param: string]: string | string[] | boolean | number };
  showLoadingImmediately?: boolean;
  hideLoading?: boolean;
  ignoreError?: boolean;
  ignoreUnknowError?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  /**
   * constructor
   * @param  HttpClient The http client
   */
  constructor(private readonly httpClient: HttpClient) { }

  /**
   * Http get
   * @param path The api path
   * @param options The request options
   */
  get(path: string, options?: RequestOptions): Observable<any> {
    const requestOptions = this.createRequestOptions(options);

    return this.processResponse(this.httpClient.get(environment.baseApiUrl + path, requestOptions));
  }

  /**
   * Http post
   * @param path The api path
   * @param options The request options
   */
  post(path: string, options?: RequestOptions): Observable<any> {
    const requestOptions = this.createRequestOptions(options);

    return this.processResponse(
      this.httpClient.post(environment.baseApiUrl + path, options && options && options.data ? options.data : null, requestOptions),
    );
  }

  /**
   * Http put
   * @param path The api path
   * @param options The request options
   */
  put(path: string, options?: RequestOptions): Observable<any> {
    const requestOptions = this.createRequestOptions(options);

    return this.processResponse(
      this.httpClient.put(environment.baseApiUrl + path, options && options && options.data ? options.data : null, requestOptions),
    );
  }

  /**
   * Http delete
   * @param path the api path
   * @param options the request options
   */
  delete(path: string, options?: RequestOptions): Observable<any> {
    const requestOptions = this.createRequestOptions(options);

    return this.processResponse(this.httpClient.delete(environment.baseApiUrl + path, requestOptions));
  }

  jsonToFormData(json: object): FormData {
    return ObjectUtil.jsonToFormData(json);
  }

  jsonToUrlParam(json: object): string {
    const formData = ObjectUtil.jsonToFormData(json);
    const urlParams = [];
    formData.forEach((value, key) => {
      urlParams.push(`${encodeURIComponent(key)} = ${encodeURIComponent(value.toString())}`);
    });

    return urlParams.join('&');
  }

  private createRequestOptions(
    options?: RequestOptions,
  ): {
    headers: null;
    params: null;
    observe: any;
  } {
    const requestOptions = {
      headers: null,
      params: null,
      observe: 'response' as any,
    };
    if (options) {
      requestOptions.params = new InterceptorHttpParams(options);
      if (options.hideLoading) {
        requestOptions.headers = new HttpHeaders({ ignoreLoadingBar: 'true' });
      }
    }

    return requestOptions;
  }

  private processResponse(responseOb: Observable<any>): Observable<any> {
    return responseOb.pipe(
      map(response => {
        if (response.status === 200) {
          return response.body;
        }
        throwError(response);
      })
    )
  }
}
