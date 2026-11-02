"""Treat actual WebGL compile/use failures as errors, not just JS exceptions."""
def observe_graphics_errors(page, errors):
 def message(m):
  text=m.text
  if any(token in text for token in ['Shader Error','INVALID_OPERATION','program not valid','GL_INVALID_OPERATION']):
   value='WebGL console: '+text
   if value not in errors:errors.append(value)
 page.on('console',message)
