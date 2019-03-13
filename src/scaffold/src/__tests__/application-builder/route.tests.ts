import { Route, RouteVariables } from './../../application-builder/route'
import { Request } from './../service-worker.mocks'

describe('Route tests', () => {
    const base = 'https://www.example.com';

    beforeEach(() => {
        
    });

    test('basic matching', () => {
        const route = new Route('/Area/SomeController/SomeAction', base);

        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction`))).toBe(true);
        expect(route.isMatch(new Request(`${base}/Area/SomeController/SomeAction2`))).toBe(false);
    });

    test('path variables', () => {
        const route = new Route('/Area/{controller}/{action}', base);
        const url = `${base}/Area/SomeController/SomeAction`;

        expect(route.isMatch(new Request(url))).toBe(true);

        const variables = route.getVariables(url);
        expect(variables).toBeTruthy();
        expect(variables.path.size).toBe(2);
        expect(variables.path.get('controller')).toBe('SomeController');
        expect(variables.path.get('action')).toBe('SomeAction');
    });

    test('query variables', () => {
        const route = new Route('/Path?param1={param1Value}&param2=notavariable', base);

        expect(route.isMatch(new Request(`${base}/Path`))).toBe(true);
        expect(route.getVariables(`${base}/Path`).query.size).toBe(0);
    });
});