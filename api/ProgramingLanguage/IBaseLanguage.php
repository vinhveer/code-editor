<?php

interface IBaseLanguage
{
    /**
     * Execute code with given input
     * 
     * @param string $input Input data for the code execution
     * @return string Output result from code execution
     */
    public function run(string $input): string;
}
