import { INestApplication, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { REDOC_EXCLUDE_CONTROLLER_KEY, REDOC_EXCLUDE_ENDPOINT_KEY } from '../decorators';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Controller } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { NestjsRedoxModule, RedocOptions } from 'nestjs-redox';


export async function setupRedoc(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();


  const document = SwaggerModule.createDocument(app, config);

  filterRedocDocument(app, document);
  const redocOptions: RedocOptions = {
    logo: {
      backgroundColor: '#F0F0F0',
      altText: 'API Docs',
    },
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false,
  };


  NestjsRedoxModule.setup('docs', app, document, {
    standalone: true, // Self-host Redoc assets (privacy/offline friendly)
  }, redocOptions);
}


function getRoutesWithExcludeDecorator(app: INestApplication) {
  const reflector = app.get(Reflector);
  const modulesContainer = app.get(ModulesContainer);
  const configService = app.get(ConfigService);

  /**
   * Default to 'api/v1.0' if not defined
   */
  const basePath = configService.get<string>('API_BASE_PATH', 'api/v1.0');
  const excludedPaths = new Map<string, string[]>();
  const excludedControllers = new Set<string>();

  modulesContainer.forEach(module => {
    module.controllers.forEach((controller: InstanceWrapper<Controller>) => {
      const { instance } = controller;

      if (!instance) {
        return;
      }

      const prototype = Object.getPrototypeOf(instance);
      const isControllerExcluded = reflector.get<boolean>(
        REDOC_EXCLUDE_CONTROLLER_KEY,
        instance.constructor,
      );

      Object.getOwnPropertyNames(prototype).forEach((methodName) => {
        const targetMethod = prototype[methodName];

        const hasCustomDecorator = reflector.get<boolean>(
          REDOC_EXCLUDE_ENDPOINT_KEY,
          targetMethod,
        );
        const controllerPath = reflector.get<string[]>('path', instance.constructor) || '';
        const methodPath = reflector.get<string[]>('path', targetMethod) || '';

        if (hasCustomDecorator || isControllerExcluded) {
          const methodMetadata = reflector.get<RequestMethod>(
            'method',
            targetMethod,
          );

          const requestMethod = RequestMethod[methodMetadata];

          let fullPath = `/${basePath}/${controllerPath}/${methodPath}`
            .replace(/\/+/g, '/')
            .replace(/:(\w+)/g, '{$1}');

          if (fullPath.endsWith('/')) fullPath = fullPath.slice(0, fullPath.length - 1);

          if (isControllerExcluded) {
            excludedControllers.add(fullPath);
          } else {
            const alreadyExistMethods = excludedPaths.get(fullPath) || [];
            alreadyExistMethods.push(requestMethod.toLowerCase());
            excludedPaths.set(fullPath, alreadyExistMethods);
          }
        }
      });
    });
  });

  return { excludedPaths, excludedControllers };
}


function filterRedocDocument(app: INestApplication, document: OpenAPIObject) {
  const { excludedPaths, excludedControllers } = getRoutesWithExcludeDecorator(app)

  Object.entries(document.paths).filter(([path]) => {
    if (excludedControllers.has(path)) {
      delete document.paths[path]
    }
    else if (document.paths[path]) {

      const keysExists = Object.keys(document.paths[path]).filter(method => excludedPaths.get(path)?.find(pathMethod => pathMethod === method))

      keysExists.forEach((keyExists) => {
        if (keyExists === 'get' || keyExists === 'post' || keyExists === 'patch' || keyExists === 'put' || keyExists === 'delete') {

          delete document.paths[path][keyExists]
        }
      })
    }

  })

}

