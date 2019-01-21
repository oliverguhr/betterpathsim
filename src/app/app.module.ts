import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { App } from './app';
import { Assembler } from './assembler/assembler';

@NgModule({
    declarations: [
        App,
        Assembler
    ],
    
    imports: [
        BrowserModule
    ],
    
    providers: [],
    
    bootstrap: [App]
}) 
export class AppModule { 

}

