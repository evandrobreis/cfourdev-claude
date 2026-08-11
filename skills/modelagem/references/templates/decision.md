---
id: MD-001
title: Título curto, na voz de quem decidiu
decidido_por: arquiteto
date: AAAA-MM-DD
status: vigente         # vigente | substituida
substitui: null         # id da decisão que esta substitui, quando houver
governa:                # o que esta decisão passa a reger
  - model/...
---

## O que foi decidido

Em uma frase afirmativa, com as palavras que o arquiteto usou.

## O que ele disse

A citação ou o resumo fiel do que foi dito, e em que contexto. Isto existe para
que, seis meses depois, ninguém confunda a decisão dele com uma leitura sua.

## O que isso governa daqui para frente

- o que muda em `model/`;
- a convenção que passa a valer, e que vai para `$M/model/MODELING-CONVENTIONS.md`;
- o que fica pendente por causa disto.

> Só entra aqui o que o arquiteto **decidiu e informou**. Inferência sua não é
> decisão: se ninguém decidiu, o lugar é `questions`, no `project-context.yaml`.
