import { ProxyService } from './services/ProxyService';


export default {
    async fetch(request: Request, environment: Env, context: ExecutionContext): Promise<Response> {
        const proxyService: ProxyService = new ProxyService(request, environment);

        return await proxyService.handle();
    }
} satisfies ExportedHandler<Env>;
