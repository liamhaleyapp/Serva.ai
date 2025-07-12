
import React, { useState } from 'react';

export default function Postmaistro() {
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const params: Record<string, any> = {};
    formData.forEach((value, key) => { params[key] = value; });

    let body = undefined;
    if (true) {
      // Build body object from form fields (flattened keys)
      body = {};
      Object.keys(params).forEach((k) => {
        // Support nested keys like 'params.blogTopic'
        const keys = k.split('.');
        let ref = body;
        keys.forEach((key, idx) => {
          if (idx === keys.length - 1) {
            ref[key] = params[k];
          } else {
            ref[key] = ref[key] || {};
            ref = ref[key];
          }
        });
      });
    }

    const res = await fetch(
      `/maistro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    setResult(await res.json());
  };

  return (
    <div style={{border: '1px solid #eee', padding: 16, marginBottom: 16}}>
      <h3>Run mAistro NTL or agent</h3>
      <form onSubmit={handleSubmit}>
        <div>
      <label>overrideschema - Find variables based on post body.  Return all variables as the base presponse body, overriding the normal NS schema. All POST options will be ignored. Set this to a string value of 'true' to activate:</label>
      <input name="overrideschema" type="text" />
    </div>
<div>
      <label>overrideagent - If using overrideSchema you must pass your agent name here. All other POST options will be ignored.:</label>
      <input name="overrideagent" type="text" />
    </div>
<div>
      <label>debug - Include NS debug information in a field named 'neuralseek'. Set this to a string value of 'true' to activate:</label>
      <input name="debug" type="text" />
    </div>
        
    <div style={{ marginLeft: 16 }}>
      <label>ntl - The NTL script to evaluate.  Include either this or agent - not both</label>
      <input name="ntl" type="text" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>agent - The agent to use. Include either this or NTL</label>
      <input name="agent" type="text" placeholder="BlogCraftAI" />
    </div>
  
      <div style={{ marginLeft: 16 }}>
        <label>params - An array of parameters to use in evaluation of the NTL</label>
        <input name="params" type="text" placeholder="Comma-separated values" />
      </div>
    
      <div style={{ marginLeft: 16 }}>
        <label>
          <input name="options.streaming" type="checkbox" />
          options.streaming - Return the response via SSE streaming.  This is not compatible with most Virtual Agent platforms, and is intentded for direct website use.
        </label>
      </div>
    
    <div style={{ marginLeft: 16 }}>
      <label>options.llm - Override the LLM load balancer and force seek to use a specific LLM.  Input the LLM code here.  You must have a valid model card set up on the configure tab for the code you input.</label>
      <input name="options.llm" type="text" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>options.user_id - Set the user_id. Useful and required if you have a corporate document filter set</label>
      <input name="options.user_id" type="text" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>options.timeout - Timeout in miliseconds. (optional)</label>
      <input name="options.timeout" type="number" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>options.temperatureMod - Shift the model's baseline temperature weighting by a percentage</label>
      <input name="options.temperatureMod" type="number" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>options.toppMod - Shift the model's baseline probability weighting by a percentage</label>
      <input name="options.toppMod" type="number" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>options.freqpenaltyMod - Shift the model's baseline frequency penalty weighting by a percentage</label>
      <input name="options.freqpenaltyMod" type="number" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>options.minTokens - Set the minimum tokens you  want the model to produce</label>
      <input name="options.minTokens" type="number" placeholder="" />
    </div>
  
    <div style={{ marginLeft: 16 }}>
      <label>options.maxTokens - Set the maximum tokens you  want the model to produce</label>
      <input name="options.maxTokens" type="number" placeholder="" />
    </div>
  
      <div style={{ marginLeft: 16 }}>
        <label>options.lastTurn - lastTurn is a flexible object. It is backwards compatible with the original single turn object, as well as compatible with the Watson Assistant session history format.</label>
        <input name="options.lastTurn" type="text" placeholder="Comma-separated values" />
      </div>
    
      <div style={{ marginLeft: 16 }}>
        <label>
          <input name="options.returnVariables" type="checkbox" />
          options.returnVariables - Return the final state of all variables in a dense object
        </label>
      </div>
    
      <div style={{ marginLeft: 16 }}>
        <label>
          <input name="options.returnVariablesExpanded" type="checkbox" />
          options.returnVariablesExpanded - Return the final state of all variables in the same format as the input params
        </label>
      </div>
    
      <div style={{ marginLeft: 16 }}>
        <label>
          <input name="options.returnRender" type="checkbox" />
          options.returnRender - Return the midstate renders
        </label>
      </div>
    
      <div style={{ marginLeft: 16 }}>
        <label>
          <input name="options.returnSource" type="checkbox" />
          options.returnSource - Return the source parts
        </label>
      </div>
    
    <div style={{ marginLeft: 16 }}>
      <label>options.maxRecursion - The maximum number of recursive calls to Explore.  Use caution that you have not created an endless loop as you increase the maximum, as each Explore is charged.</label>
      <input name="options.maxRecursion" type="number" placeholder="10" />
    </div>
  
        <button type="submit">Send</button>
      </form>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
