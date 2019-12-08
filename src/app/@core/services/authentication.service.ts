import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt'
import { BehaviorSubject, Observable, of, bindNodeCallback } from 'rxjs';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly jwtHelperService: JwtHelperService;
  private readonly userChange$ = new BehaviorSubject<any>(null);
  constructor(private readonly router: Router, private readonly httpService: HttpService) {
    this.jwtHelperService = new JwtHelperService();
    this.userChange$.next(this.getCurrentUser());
  }

  userChange() {
    return this.userChange$.asObservable();
  }

  register(data: any): Observable<any> {
    // const credential = {
    //   user: {
    //     username: data.email,
    //     password: data.password,
    //   },
    //   accessToken: 'accessToken',
    // };
    // this.saveCredential(credential, false);
    // return of(credential).pipe(delay(2000));
    return new Observable(observer => {
      // Sign out after register
      this.cognitoSignOut();
      const userPool = new CognitoUserPool({
        UserPoolId: environment.cognitoUserPoolId,
        ClientId: environment.cognitoClientId,
        Storage: sessionStorage,
      });

      const attributeList = [];

      const attributeEmail = new CognitoUserAttribute({
        Name: 'email',
        Value: data.email,
      });
      attributeList.push(attributeEmail);

      userPool.signUp(data.email, data.password, attributeList, null, (err, result) => {
        if (err) {
          observer.error(err);
          observer.complete();
        } else {
          observer.next(result.user);
          this.userChange$.next(result.user);
          observer.complete();
        }
      });
    });
  }

  forgotPassword(email: any): Observable<any> {
    // FIXME: Do action here
    // const user = this.userService.forgotPassword(email);
    // return user.pipe(delay(2000));
    return of(null);
  }

  /**
   * Signout and remove cognito current user from `localStorage` & `sessionStorage`
   */
  private cognitoSignOut() {
    let currentUser = this.getCurrentUser(localStorage);
    if (currentUser) {
      currentUser.signOut();
    }

    currentUser = this.getCurrentUser(sessionStorage);
    if (currentUser) {
      currentUser.signOut();
    }
    this.userChange$.next(null);
  }

  /**
   * Get current user from `localStorage` or `sessionStorage`
   */
  private getCurrentUser(storage?: Storage): CognitoUser {
    const storages: Array<Storage> = storage ? [storage] : [localStorage, sessionStorage];
    for (const st of storages) {
      const userPool = new CognitoUserPool({
        UserPoolId: environment.cognitoUserPoolId,
        ClientId: environment.cognitoClientId,
        Storage: st,
      });
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        return currentUser;
      }
    }

    return null;
  }

  /**
   * Authenticate by cognito API
   * @param username the username
   * @param password the password
   * @param remember the remember flag
   * @returns the `Observable<CognitoUserSession>`
   */
  authenticate(username: string, password: string, remember: boolean = true): Observable<CognitoUserSession> {
    return new Observable(observer => {
      // Signout after verify login account
      this.cognitoSignOut();

      const authData = {
        Username: username,
        Password: password,
      };

      const storage = !!remember ? localStorage : sessionStorage;
      const userPool = new CognitoUserPool({
        UserPoolId: environment.cognitoUserPoolId,
        ClientId: environment.cognitoClientId,
        Storage: storage,
      });
      const authDetails = new AuthenticationDetails(authData);
      const userData = {
        Username: username,
        Pool: userPool,
        Storage: storage,
      };

      const cognitoUser = new CognitoUser(userData);
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result: CognitoUserSession) => {
          observer.next(result);
          this.userChange$.next(cognitoUser);
          observer.complete();
        },
        onFailure: err => {
          observer.error(err);
          observer.complete();
        }
      });
    });
  }

  /**
   * Logout and remove current user information
   */
  logout() {
    this.cognitoSignOut();
  }

  /**
   * Get access token from cognito
   */
  getAccessToken(): Observable<any> {
    const cognitoUser = this.getCurrentUser();
    if (cognitoUser) {
      return bindNodeCallback((callback: (error: Error, session: CognitoUserSession) => void) => cognitoUser.getSession(callback))().pipe(
        map((session: CognitoUserSession) => session.getIdToken().getJwtToken()),
        catchError(error => of(null)),
      );
    }

    return of(null);
  }
}
